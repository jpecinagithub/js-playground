import { serialize, toTableSer } from './serialize';
import type { LogMsg, Ser } from './types';

/* ------------------------------------------------------------------ */
/* Source scanning: find top-level `const/let/var` names for the       */
/* Variables inspector. Best-effort static analysis (documented).      */
/* ------------------------------------------------------------------ */

/**
 * Mask comments, strings and template-literal text with spaces, keeping
 * newlines and structural characters ({ } ( ) , ; = :) visible so the
 * declaration scanner below only sees real code.
 */
export function maskCode(src: string): string {
  let out = '';
  let i = 0;
  const n = src.length;
  type State = 'code' | 'line' | 'block' | 'sq' | 'dq' | 'tpl';
  let state: State = 'code';
  // stack of brace depths where a `${` opened, to know when we return to a template
  const tplStack: number[] = [];
  let codeBrace = 0;
  const push = (ch: string) => {
    out += ch;
  };
  const mask = (ch: string) => {
    out += ch === '\n' ? '\n' : ' ';
  };
  const prevNonSpace = (from: number): string => {
    for (let j = from; j >= 0; j--) {
      const c = src[j];
      if (c !== ' ' && c !== '\t' && c !== '\n' && c !== '\r') return c;
    }
    return '';
  };
  /** If src[i] starts a regex literal, mask it whole and return the new index. */
  const tryRegex = (idx: number): number | null => {
    const prev = prevNonSpace(idx - 1);
    // after an identifier-ish char, `)`, `]` or `.`? it's division, not a regex
    if (/[A-Za-z0-9_$\]\)]/.test(prev)) return null;
    let j = idx + 1;
    let inClass = false;
    while (j < n) {
      const c = src[j];
      if (c === '\\') {
        j += 2;
        continue;
      }
      if (c === '\n') return null;
      if (c === '[') inClass = true;
      else if (c === ']') inClass = false;
      else if (c === '/' && !inClass) {
        j++;
        while (j < n && /[a-z]/i.test(src[j])) j++; // flags
        return j;
      }
      j++;
    }
    return null;
  };

  while (i < n) {
    const c = src[i];
    const nx = src[i + 1] ?? '';
    if (state === 'code') {
      if (c === '/' && nx === '/') {
        state = 'line';
        mask(c);
        mask(nx);
        i += 2;
        continue;
      }
      if (c === '/' && nx === '*') {
        state = 'block';
        mask(c);
        mask(nx);
        i += 2;
        continue;
      }
      if (c === "'") {
        state = 'sq';
        mask(c);
        i++;
        continue;
      }
      if (c === '"') {
        state = 'dq';
        mask(c);
        i++;
        continue;
      }
      if (c === '`') {
        state = 'tpl';
        mask(c);
        i++;
        continue;
      }
      if (c === '/') {
        const end = tryRegex(i);
        if (end !== null) {
          for (let j = i; j < end; j++) mask(src[j]);
          i = end;
          continue;
        }
        push(c);
        i++;
        continue;
      }
      if (c === '{') codeBrace++;
      if (c === '}') {
        if (tplStack.length > 0 && codeBrace - 1 === tplStack[tplStack.length - 1]) {
          tplStack.pop();
          codeBrace--;
          state = 'tpl';
          push(c);
          i++;
          continue;
        }
        codeBrace--;
      }
      push(c);
      i++;
      continue;
    }
    if (state === 'line') {
      if (c === '\n') {
        state = 'code';
        push(c);
      } else mask(c);
      i++;
      continue;
    }
    if (state === 'block') {
      if (c === '*' && nx === '/') {
        mask(c);
        mask(nx);
        i += 2;
        state = 'code';
        continue;
      }
      mask(c);
      i++;
      continue;
    }
    if (state === 'sq' || state === 'dq') {
      const q = state === 'sq' ? "'" : '"';
      if (c === '\\') {
        mask(c);
        mask(nx);
        i += 2;
        continue;
      }
      if (c === q) state = 'code';
      mask(c);
      i++;
      continue;
    }
    // state === 'tpl'
    if (c === '\\') {
      mask(c);
      mask(nx);
      i += 2;
      continue;
    }
    if (c === '`') {
      state = 'code';
      mask(c);
      i++;
      continue;
    }
    if (c === '$' && nx === '{') {
      tplStack.push(codeBrace);
      codeBrace++;
      state = 'code';
      push(c);
      push(nx);
      i += 2;
      continue;
    }
    mask(c);
    i++;
  }
  return out;
}

function readBalanced(src: string, i: number): { text: string; next: number } {
  const stack: string[] = [];
  let j = i;
  while (j < src.length) {
    const c = src[j];
    if (c === '{' || c === '[' || c === '(') stack.push(c);
    else if (c === '}' || c === ']' || c === ')') {
      stack.pop();
      if (stack.length === 0) {
        j++;
        break;
      }
    }
    j++;
  }
  return { text: src.slice(i, j), next: j };
}

/** Extract bound names from a destructuring pattern (one level of nesting handled recursively). */
export function patternNames(pattern: string): string[] {
  const names: string[] = [];
  const p = pattern.trim();
  if (p.length < 2) return names;
  const inner = p.slice(1, -1);
  const isObj = p[0] === '{';
  let i = 0;
  const n = inner.length;
  const skipSp = () => {
    while (i < n && /\s/.test(inner[i])) i++;
  };
  const readId = (): string | null => {
    skipSp();
    const m = /^[A-Za-z_$][\w$]*/.exec(inner.slice(i));
    if (!m) return null;
    i += m[0].length;
    return m[0];
  };
  const skipDefault = () => {
    i++; // consume '='
    let d = 0;
    while (i < n) {
      const c = inner[i];
      if (c === '{' || c === '[' || c === '(') d++;
      else if (c === '}' || c === ']' || c === ')') d--;
      else if (c === ',' && d === 0) break;
      i++;
    }
  };
  while (i < n) {
    skipSp();
    if (i >= n) break;
    const c = inner[i];
    if (c === ',') {
      i++;
      continue;
    }
    if (c === '.' && inner.slice(i, i + 3) === '...') {
      i += 3;
      skipSp();
      if (inner[i] === '{' || inner[i] === '[') {
        const r = readBalanced(inner, i);
        names.push(...patternNames(r.text));
        i = r.next;
      } else {
        const id = readId();
        if (id) names.push(id);
      }
      continue;
    }
    if (c === '{' || c === '[') {
      const r = readBalanced(inner, i);
      names.push(...patternNames(r.text));
      i = r.next;
      continue;
    }
    const id = readId();
    if (!id) {
      i++;
      continue;
    }
    skipSp();
    if (isObj && inner[i] === ':') {
      i++;
      skipSp();
      if (inner[i] === '{' || inner[i] === '[') {
        const r = readBalanced(inner, i);
        names.push(...patternNames(r.text));
        i = r.next;
      } else {
        const v = readId();
        if (v) names.push(v);
      }
      skipSp();
      if (inner[i] === '=') skipDefault();
      continue;
    }
    names.push(id);
    skipSp();
    if (inner[i] === '=') skipDefault();
  }
  return names;
}

function skipInitializer(src: string, i: number): number {
  const n = src.length;
  let depth = 0;
  while (i < n) {
    const c = src[i];
    if (c === '{' || c === '[' || c === '(') depth++;
    else if (c === '}' || c === ']' || c === ')') {
      if (depth === 0) break;
      depth--;
    } else if ((c === ',' || c === ';') && depth === 0) break;
    i++;
  }
  return i;
}

/** Names declared with top-level const/let/var (brace/paren depth 0). */
export function topLevelNames(code: string): string[] {
  const src = maskCode(code);
  const names: string[] = [];
  let i = 0;
  const n = src.length;
  let brace = 0;
  let paren = 0;
  const isIdStart = (c: string) => /[A-Za-z_$]/.test(c);
  const isIdChar = (c: string) => /[\w$]/.test(c);

  while (i < n) {
    const c = src[i];
    if (c === '{') {
      brace++;
      i++;
      continue;
    }
    if (c === '}') {
      brace--;
      i++;
      continue;
    }
    if (c === '(') {
      paren++;
      i++;
      continue;
    }
    if (c === ')') {
      paren--;
      i++;
      continue;
    }
    if (brace === 0 && paren === 0 && isIdStart(c)) {
      const fm = /^(?:async\s+)?function\s*\*?\s*([A-Za-z_$][\w$]*)/.exec(src.slice(i));
      if (fm) {
        names.push(fm[1]);
        i += fm[0].length;
        continue;
      }
      const cm = /^class\s+([A-Za-z_$][\w$]*)/.exec(src.slice(i));
      if (cm) {
        names.push(cm[1]);
        i += cm[0].length;
        continue;
      }
      const m = /^(const|let|var)\b/.exec(src.slice(i));
      if (m) {
        i += m[1].length;
        // parse the declarator list
        for (;;) {
          while (i < n && /\s/.test(src[i])) i++;
          if (i >= n || src[i] === ';') {
            if (src[i] === ';') i++;
            break;
          }
          if (src[i] === '{' || src[i] === '[') {
            const r = readBalanced(src, i);
            names.push(...patternNames(r.text));
            i = r.next;
          } else if (isIdStart(src[i])) {
            let j = i;
            while (j < n && isIdChar(src[j])) j++;
            names.push(src.slice(i, j));
            i = j;
          } else break;
          while (i < n && /\s/.test(src[i])) i++;
          if (src[i] === '=') i = skipInitializer(src, i + 1);
          while (i < n && /\s/.test(src[i])) i++;
          if (src[i] === ',') {
            i++;
            continue;
          }
          if (src[i] === ';') i++;
          break;
        }
        continue;
      }
      while (i < n && isIdChar(src[i])) i++;
      continue;
    }
    i++;
  }
  return [...new Set(names)];
}

/* ------------------------------------------------------------------ */
/* Execution with console capture + async tracking. Runs inside the     */
/* sandbox worker; pure w.r.t. messaging (events via callbacks) so it  */
/* can be unit-tested in Node.                                         */
/* ------------------------------------------------------------------ */

export interface RunEvents {
  onLog: (m: LogMsg) => void;
}

export interface RunOutcome {
  vars: Array<[string, Ser]>;
  asyncCutoff: boolean;
}

export async function runUserCode(
  code: string,
  events: RunEvents,
  opts: { budgetMs: number },
): Promise<RunOutcome> {
  const g = globalThis as unknown as Record<string, unknown>;

  const emit = (method: LogMsg['method'], args: unknown[]) => {
    try {
      events.onLog({ method, args: args.map((a) => serialize(a)) });
    } catch {
      /* serialization should not break the run */
    }
  };
  const emitRaw = (method: LogMsg['method'], sers: Ser[]) => {
    try {
      events.onLog({ method, args: sers });
    } catch {
      /* ignore */
    }
  };
  const emitError = (e: unknown) => emit('error', [e]);

  const c = console as unknown as Record<string, (...a: unknown[]) => void>;
  const oLog = c.log;
  const oInfo = c.info;
  const oWarn = c.warn;
  const oError = c.error;
  const oTable = c.table;
  const oClear = c.clear;
  const oSetTimeout = (g.setTimeout as typeof setTimeout).bind(g);
  const oClearTimeout = (g.clearTimeout as typeof clearTimeout).bind(g);
  const oSetInterval = (g.setInterval as typeof setInterval).bind(g);
  const oClearInterval = (g.clearInterval as typeof clearInterval).bind(g);
  const oFetch = typeof g.fetch === 'function' ? (g.fetch as typeof fetch).bind(g) : undefined;

  const timerIds = new Map<unknown, true>();
  const intervalIds = new Set<unknown>();
  let pendingTimers = 0;
  let pendingFetch = 0;

  c.log = (...a: unknown[]) => emit('log', a);
  c.info = (...a: unknown[]) => emit('info', a);
  c.warn = (...a: unknown[]) => emit('warn', a);
  c.error = (...a: unknown[]) => emit('error', a);
  c.table = (() => {
    // console.table with no usable data would throw; keep it total.
    return (...a: unknown[]) => emitRaw('table', [toTableSer(a[0])]);
  })() as (...a: unknown[]) => void;
  c.clear = () => {
    try {
      events.onLog({ method: 'clear', args: [] });
    } catch {
      /* ignore */
    }
  };

  g.setTimeout = ((fn: (...a: unknown[]) => void, ms?: number, ...rest: unknown[]) => {
    const id = oSetTimeout(
      () => {
        if (timerIds.delete(id)) pendingTimers--;
        try {
          fn(...rest);
        } catch (e) {
          emitError(e);
        }
      },
      ms,
    );
    timerIds.set(id, true);
    pendingTimers++;
    return id;
  }) as typeof setTimeout;
  g.clearTimeout = ((id: unknown) => {
    oClearTimeout(id as never);
    if (timerIds.delete(id)) pendingTimers--;
  }) as typeof clearTimeout;
  g.setInterval = ((fn: (...a: unknown[]) => void, ms?: number, ...rest: unknown[]) => {
    const id = oSetInterval(
      () => {
        try {
          fn(...rest);
        } catch (e) {
          emitError(e);
        }
      },
      ms,
    );
    intervalIds.add(id);
    return id;
  }) as typeof setInterval;
  g.clearInterval = ((id: unknown) => {
    intervalIds.delete(id);
    oClearInterval(id as never);
  }) as typeof clearInterval;
  if (oFetch) {
    g.fetch = ((...a: Parameters<typeof fetch>) => {
      pendingFetch++;
      return oFetch(...a).then(
        (r) => {
          pendingFetch--;
          return r;
        },
        (e) => {
          pendingFetch--;
          throw e;
        },
      );
    }) as typeof fetch;
  }

  const onUnhandled = (e: Event) => {
    const reason = (e as PromiseRejectionEvent).reason;
    emitError(reason instanceof Error ? reason : new Error('Unhandled rejection: ' + String(reason)));
  };
  if (typeof (g.addEventListener as unknown) === 'function') {
    (g.addEventListener as (t: string, f: (e: Event) => void) => void)('unhandledrejection', onUnhandled);
  }

  try {
    // Indirect eval -> runs in the worker's global scope, isolated per run
    // because each execution gets a fresh worker.
    (g.eval as (code: string) => unknown)(code);
  } catch (e) {
    emitError(e);
  }

  // Wait for pending async work (timers / fetch / intervals) up to the budget.
  const t0 = Date.now();
  let asyncCutoff = false;
  for (;;) {
    await new Promise((r) => oSetTimeout(r, 30));
    if (pendingTimers === 0 && pendingFetch === 0 && intervalIds.size === 0) break;
    if (Date.now() - t0 > opts.budgetMs) {
      asyncCutoff = true;
      break;
    }
  }
  for (const id of Array.from(timerIds.keys())) oClearTimeout(id as never);
  for (const id of Array.from(intervalIds)) oClearInterval(id as never);

  // Variables inspector: evaluate top-level declared names in the same realm.
  const vars: Array<[string, Ser]> = [];
  try {
    for (const name of topLevelNames(code)) {
      try {
        vars.push([name, serialize((g.eval as (c: string) => unknown)(name))]);
      } catch {
        vars.push([name, { k: 'undef' }]);
      }
    }
  } catch {
    /* scanning must never break the run */
  }

  if (typeof (g.removeEventListener as unknown) === 'function') {
    (g.removeEventListener as (t: string, f: (e: Event) => void) => void)('unhandledrejection', onUnhandled);
  }
  c.log = oLog;
  c.info = oInfo;
  c.warn = oWarn;
  c.error = oError;
  c.table = oTable;
  c.clear = oClear;
  g.setTimeout = oSetTimeout;
  g.clearTimeout = oClearTimeout;
  g.setInterval = oSetInterval;
  g.clearInterval = oClearInterval;
  if (oFetch) g.fetch = oFetch;

  return { vars, asyncCutoff };
}
