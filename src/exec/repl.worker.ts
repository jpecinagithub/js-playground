/// <reference lib="webworker" />
import { serialize, errorSer } from './serialize';
import type { LogMsg, Ser } from './types';

// Persistent worker for the interactive REPL: the same realm is reused, so
// `let`/`const`/`var`/function declarations survive between inputs
// (indirect eval runs in global scope).

// Property access on globalThis keeps the eval indirect (global scope),
// so declarations persist between REPL inputs.
const indirectEval = (code: string): unknown => (globalThis as { eval: (c: string) => unknown }).eval(code);

interface PendingInput {
  id: number;
  input: string;
}

const queue: PendingInput[] = [];
let busy = false;

function drain() {
  if (busy) return;
  const next = queue.shift();
  if (!next) return;
  busy = true;
  void evaluate(next).finally(() => {
    busy = false;
    drain();
  });
}

async function evaluate({ id, input }: PendingInput) {
  const post = (m: unknown) => self.postMessage(m);
  const logs: LogMsg[] = [];
  const c = console as unknown as Record<string, (...a: unknown[]) => void>;
  const orig: Record<string, (...a: unknown[]) => void> = {};
  for (const m of ['log', 'info', 'warn', 'error'] as const) {
    orig[m] = c[m];
    c[m] = (...a: unknown[]) => {
      logs.push({ method: m, args: a.map((x) => serialize(x)) });
    };
  }

  let result: Ser;
  try {
    let v: unknown;
    try {
      v = indirectEval(input);
    } catch (err) {
      // Allow top-level await in the REPL by wrapping once.
      if (err instanceof SyntaxError && /(^|[^\w$])await[^\w$]/.test(input)) {
        v = await indirectEval(`(async () => { return (${input}); })()`);
      } else {
        throw err;
      }
    }
    if (v instanceof Promise) v = await v;
    result = serialize(v);
  } catch (err) {
    result = err instanceof Error ? errorSer(err) : { k: 'err', name: 'Error', msg: String(err), line: null };
  } finally {
    for (const m of Object.keys(orig)) c[m] = orig[m];
  }
  post({ type: 'out', id, logs, result });
}

self.onmessage = (e: MessageEvent) => {
  const { id, input } = e.data as { id: number; input: string };
  queue.push({ id, input });
  drain();
};

export {};
