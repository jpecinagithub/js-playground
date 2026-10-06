// JSON-safe serialized representation of any JS value, produced inside the
// sandbox worker and rendered by the console UI.

export type Ser =
  | { k: 'str'; v: string }
  | { k: 'num'; v: number | string } // NaN / ±Infinity travel as strings
  | { k: 'big'; v: string }
  | { k: 'bool'; v: boolean }
  | { k: 'null' }
  | { k: 'undef' }
  | { k: 'sym'; v: string }
  | { k: 'fn'; v: string }
  | { k: 'arr'; len: number; items: Ser[]; more: number }
  | { k: 'obj'; cls: string; entries: Array<[string, Ser]>; more: number }
  | { k: 'map'; size: number; entries: Array<[Ser, Ser]>; more: number }
  | { k: 'set'; size: number; items: Ser[]; more: number }
  | { k: 'date'; v: string }
  | { k: 're'; v: string }
  | { k: 'prom' }
  | { k: 'err'; name: string; msg: string; line: number | null }
  | { k: 'tbl'; cols: string[]; rows: Ser[][] }
  | { k: 'circ' }
  | { k: 'other'; v: string };

export type LogMethod = 'log' | 'info' | 'warn' | 'error' | 'table' | 'clear';

export interface LogMsg {
  method: LogMethod;
  args: Ser[];
}
