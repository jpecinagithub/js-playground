/// <reference lib="webworker" />
import { serialize, errorSer } from './serialize';
import { maskCode } from './sandbox';
import type { LogMsg, Ser } from './types';

// Persistent worker for the interactive REPL: the same realm is reused, so
// `var`/function declarations survive between inputs (indirect eval runs in
// global scope). `let`/`const` do NOT survive across eval calls per spec, so
// a lone top-level `let`/`const` declaration is rewritten to `var` — the
// common REPL case (`let qq = 21` then `qq * 2`) then keeps working.

// Property access on globalThis keeps the eval indirect (global scope),
// so declarations persist between REPL inputs.
const indirectEval = (code: string): unknown => (globalThis as { eval: (c: string) => unknown }).eval(code);

/** Rewrite `let x = …` / `const x = …` to `var` when the whole input is a single declaration. */
function loneDeclarationToVar(input: string): string {
  if (!/^\s*(let|const)\b/.test(input)) return input;
  const masked = maskCode(input);
  let depth = 0;
  let semis = 0;
  for (const ch of masked) {
    if (ch === '{' || ch === '[' || ch === '(') depth++;
    else if (ch === '}' || ch === ']' || ch === ')') depth--;
    else if (ch === ';' && depth === 0) semis++;
  }
  if (masked.trimEnd().endsWith(';')) semis--;
  if (semis !== 0) return input;
  return input.replace(/^\s*(let|const)\b/, 'var');
}

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
    const src = loneDeclarationToVar(input);
    try {
      v = indirectEval(src);
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
