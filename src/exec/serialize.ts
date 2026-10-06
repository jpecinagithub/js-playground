import type { Ser } from './types';

const MAX_DEPTH = 6;
const MAX_ITEMS = 60;
const MAX_NODES = 4000;
const MAX_STR = 2000;

function shortString(v: unknown): string {
  try {
    const s = String(v);
    return s.length > 200 ? s.slice(0, 200) + '…' : s;
  } catch {
    return Object.prototype.toString.call(v);
  }
}

/** Extract the user-code line number from an eval stack frame. */
export function extractLine(err: Error): number | null {
  const stack = (err && err.stack) || '';
  // Chrome (worker eval):  "... <anonymous>:12:5 ..."
  // Node:                  "evalmachine.<anonymous>:12:5"
  const m = /(?:evalmachine\.)?<anonymous>:(\d+):(\d+)/.exec(stack);
  return m ? parseInt(m[1], 10) : null;
}

export function errorSer(err: Error): Ser {
  return {
    k: 'err',
    name: err.name || 'Error',
    msg: String((err as { message?: unknown }).message ?? ''),
    line: extractLine(err),
  };
}

export function serialize(
  value: unknown,
  depth = 0,
  seen: WeakMap<object, true> = new WeakMap(),
  count: { n: number } = { n: 0 },
): Ser {
  count.n++;
  if (count.n > MAX_NODES) return { k: 'other', v: '…' };
  if (value === null) return { k: 'null' };

  switch (typeof value) {
    case 'undefined':
      return { k: 'undef' };
    case 'string': {
      const s = value as string;
      return { k: 'str', v: s.length > MAX_STR ? s.slice(0, MAX_STR) + '…' : s };
    }
    case 'number': {
      const n = value as number;
      return { k: 'num', v: Number.isFinite(n) ? n : String(n) };
    }
    case 'bigint':
      return { k: 'big', v: (value as bigint).toString() };
    case 'boolean':
      return { k: 'bool', v: value as boolean };
    case 'symbol':
      return { k: 'sym', v: String(value) };
    case 'function': {
      const name = (value as { name?: string }).name;
      return { k: 'fn', v: name ? `ƒ ${name}()` : 'ƒ ()' };
    }
  }

  if (depth >= MAX_DEPTH) return { k: 'other', v: shortString(value) };

  const o = value as Record<string, unknown>;
  if (seen.has(o)) return { k: 'circ' };
  seen.set(o, true);
  try {
    if (value instanceof Promise) return { k: 'prom' };
    if (value instanceof Date) return { k: 'date', v: (value as Date).toISOString() };
    if (value instanceof RegExp) return { k: 're', v: String(value) };
    if (value instanceof Error) return errorSer(value as Error);

    if (value instanceof Map) {
      const all = Array.from((value as Map<unknown, unknown>).entries());
      const shown = all.slice(0, MAX_ITEMS);
      return {
        k: 'map',
        size: all.length,
        entries: shown.map(
          ([kk, vv]) =>
            [serialize(kk, depth + 1, seen, count), serialize(vv, depth + 1, seen, count)] as [Ser, Ser],
        ),
        more: Math.max(0, all.length - shown.length),
      };
    }
    if (value instanceof Set) {
      const all = Array.from(value as Set<unknown>);
      const shown = all.slice(0, MAX_ITEMS);
      return {
        k: 'set',
        size: all.length,
        items: shown.map((v) => serialize(v, depth + 1, seen, count)),
        more: Math.max(0, all.length - shown.length),
      };
    }
    if (Array.isArray(value)) {
      const len = value.length;
      const shown = value.slice(0, MAX_ITEMS);
      return {
        k: 'arr',
        len,
        items: shown.map((v) => serialize(v, depth + 1, seen, count)),
        more: Math.max(0, len - shown.length),
      };
    }

    const ctor = (o as { constructor?: unknown }).constructor as { name?: string } | undefined;
    const cls =
      typeof ctor === 'function' && ctor.name && ctor.name !== 'Object' ? String(ctor.name) : 'Object';
    const keys = Object.keys(o);
    const shown = keys.slice(0, MAX_ITEMS);
    return {
      k: 'obj',
      cls,
      entries: shown.map((kk) => [kk, serialize(o[kk], depth + 1, seen, count)] as [string, Ser]),
      more: Math.max(0, keys.length - shown.length),
    };
  } finally {
    seen.delete(o);
  }
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' &&
  v !== null &&
  !Array.isArray(v) &&
  (v as { constructor?: unknown }).constructor === Object;

/** Build a console.table representation when the data looks tabular. */
export function toTableSer(data: unknown): Ser {
  const MAX_ROWS = 30;
  const MAX_COLS = 12;
  try {
    if (Array.isArray(data) && data.length > 0) {
      const slice = data.slice(0, MAX_ROWS);
      if (slice.every(isRecord)) {
        const cols: string[] = [];
        for (const row of slice)
          for (const k of Object.keys(row)) if (!cols.includes(k) && cols.length < MAX_COLS) cols.push(k);
        return { k: 'tbl', cols, rows: slice.map((row) => cols.map((c) => serialize(row[c]))) };
      }
    }
    if (isRecord(data)) {
      const vals = Object.values(data).slice(0, MAX_ROWS);
      if (vals.length > 0 && vals.every(isRecord)) {
        const cols: string[] = ['(index)'];
        for (const row of vals)
          for (const k of Object.keys(row)) if (!cols.includes(k) && cols.length < MAX_COLS) cols.push(k);
        const keys = Object.keys(data).slice(0, MAX_ROWS);
        return {
          k: 'tbl',
          cols,
          rows: keys.map((key, i) => [{ k: 'str', v: key } as Ser, ...cols.slice(1).map((c) => serialize((vals[i] as Record<string, unknown>)[c]))]),
        };
      }
    }
  } catch {
    /* fall through to plain serialization */
  }
  return serialize(data);
}
