import RunWorker from './run.worker.ts?worker';
import ReplWorker from './repl.worker.ts?worker';
import type { LogMsg, Ser } from './types';

/* ------------------------- main code runs ------------------------- */

export interface RunCallbacks {
  onLog: (log: LogMsg) => void;
  onDone: (info: { vars: Array<[string, Ser]>; asyncCutoff: boolean; durationMs: number }) => void;
  onTimeout: () => void;
}

/** Hard watchdog for a blocked worker thread (e.g. `while(true){}`). */
const MASTER_TIMEOUT_MS = 12000;

export function executeCode(code: string, cb: RunCallbacks): { cancel: () => void } {
  const worker: Worker = new RunWorker();
  let finished = false;

  const finish = () => {
    if (finished) return;
    finished = true;
    clearTimeout(timer);
    worker.terminate();
  };

  const timer = setTimeout(() => {
    if (finished) return;
    finish();
    cb.onTimeout();
  }, MASTER_TIMEOUT_MS);

  worker.onmessage = (e: MessageEvent) => {
    const m = e.data as
      | { type: 'log'; log: LogMsg }
      | { type: 'done'; vars: Array<[string, Ser]>; asyncCutoff: boolean; durationMs: number };
    if (m.type === 'log') {
      cb.onLog(m.log);
    } else if (m.type === 'done') {
      if (finished) return;
      const info = { vars: m.vars, asyncCutoff: m.asyncCutoff, durationMs: m.durationMs };
      finish();
      cb.onDone(info);
    }
  };
  worker.onerror = () => {
    if (finished) return;
    finish();
    cb.onTimeout();
  };

  worker.postMessage({ code });
  return { cancel: finish };
}

/* ------------------------------ REPL ------------------------------ */

export interface ReplOutput {
  id: number;
  input: string;
  logs: LogMsg[];
  result: Ser;
}

const REPL_TIMEOUT_MS = 4000;

export class ReplSession {
  private worker: Worker = new ReplWorker();
  private seq = 0;
  private pending: { id: number; input: string; timer: ReturnType<typeof setTimeout> } | null = null;
  onOutput: (out: ReplOutput) => void = () => {};
  onSessionReset: () => void = () => {};

  eval(input: string): void {
    if (this.pending) return; // single-flight; UI disables the input meanwhile
    const id = ++this.seq;
    const timer = setTimeout(() => {
      // Expression blocked the worker (infinite loop): restart the session.
      this.worker.terminate();
      this.worker = new ReplWorker();
      this.wire();
      this.pending = null;
      this.onSessionReset();
    }, REPL_TIMEOUT_MS);
    this.pending = { id, input, timer };
    this.worker.postMessage({ id, input });
  }

  private wire() {
    this.worker.onmessage = (e: MessageEvent) => {
      const m = e.data as { type: 'out'; id: number; logs: LogMsg[]; result: Ser; input?: string };
      if (m.type !== 'out' || !this.pending || m.id !== this.pending.id) return;
      clearTimeout(this.pending.timer);
      const input = this.pending.input;
      this.pending = null;
      this.onOutput({ id: m.id, input, logs: m.logs, result: m.result });
    };
  }

  constructor() {
    this.wire();
  }

  dispose() {
    if (this.pending) clearTimeout(this.pending.timer);
    this.pending = null;
    this.worker.terminate();
  }
}
