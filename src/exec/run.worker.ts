/// <reference lib="webworker" />
import { runUserCode } from './sandbox';

// One execution = one fresh worker (spawned per run by the main thread),
// so infinite loops can simply be terminated and state never leaks.

self.onmessage = async (e: MessageEvent) => {
  const { code } = e.data as { code: string };
  const post = (m: unknown) => self.postMessage(m);
  const t0 = performance.now();
  try {
    const { vars, asyncCutoff } = await runUserCode(
      code,
      { onLog: (log) => post({ type: 'log', log }) },
      { budgetMs: 10000 },
    );
    post({ type: 'done', vars, asyncCutoff, durationMs: Math.round(performance.now() - t0) });
  } catch (err) {
    post({
      type: 'done',
      vars: [],
      asyncCutoff: false,
      durationMs: Math.round(performance.now() - t0),
      workerError: String(err),
    });
  }
};

export {};
