import { useState } from 'react';
import type { Ser } from '../exec/types';

function Preview({ items }: { items: React.ReactNode[] }) {
  return (
    <span className="v-preview">
      {items.map((it, i) => (
        <span key={i}>
          {i > 0 && ', '}
          {it}
        </span>
      ))}
    </span>
  );
}

function Expandable({
  label,
  preview,
  children,
}: {
  label: string;
  preview: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <span className="v-exp">
      <button type="button" className="v-toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="v-caret">{open ? '▾' : '▸'}</span> {label}
      </button>
      {open ? <span className="v-children">{children}</span> : <Preview items={[preview]} />}
    </span>
  );
}

export function ValueView({ value }: { value: Ser }) {
  switch (value.k) {
    case 'str':
      return <span className="v-str">“{value.v}”</span>;
    case 'num':
      return <span className="v-num">{String(value.v)}</span>;
    case 'big':
      return <span className="v-num">{value.v}n</span>;
    case 'bool':
      return <span className="v-bool">{value.v ? 'true' : 'false'}</span>;
    case 'null':
      return <span className="v-nil">null</span>;
    case 'undef':
      return <span className="v-nil">undefined</span>;
    case 'sym':
      return <span className="v-sym">{value.v}</span>;
    case 'fn':
      return <span className="v-fn">{value.v}</span>;
    case 'date':
      return <span className="v-date">{value.v}</span>;
    case 're':
      return <span className="v-re">{value.v}</span>;
    case 'prom':
      return <span className="v-prom">Promise {'{ <pending> }'}</span>;
    case 'circ':
      return <span className="v-nil">{'<circular>'}</span>;
    case 'other':
      return <span className="v-other">{value.v}</span>;
    case 'err':
      return (
        <span className="v-err-inline">
          {value.name}: {value.msg}
        </span>
      );
    case 'arr': {
      const label = `Array(${value.len})`;
      const previewItems = value.items.slice(0, 4).map((v, i) => <ValueView key={i} value={v} />);
      return (
        <Expandable
          label={label}
          preview={
            <>
              [{previewItems.length > 0 ? <Preview items={previewItems} /> : null}
              {value.len > value.items.length ? ', …' : ''}]
            </>
          }
        >
          <span className="v-list">
            {value.items.map((v, i) => (
              <span key={i} className="v-row">
                <span className="v-idx">{i}:</span> <ValueView value={v} />
              </span>
            ))}
            {value.more > 0 && <span className="v-more">… {value.more} more</span>}
          </span>
        </Expandable>
      );
    }
    case 'obj': {
      const previewItems = value.entries.slice(0, 3).map(([k, v], i) => (
        <span key={i}>
          <span className="v-key">{k}</span>: <ValueView value={v} />
        </span>
      ));
      return (
        <Expandable
          label={value.cls}
          preview={
            <>
              {'{'}
              <Preview items={previewItems} />
              {value.more > 0 || value.entries.length > 3 ? ', …' : ''} {'}'}
            </>
          }
        >
          <span className="v-list">
            {value.entries.map(([k, v], i) => (
              <span key={i} className="v-row">
                <span className="v-key">{k}</span>: <ValueView value={v} />
              </span>
            ))}
            {value.more > 0 && <span className="v-more">… {value.more} more</span>}
          </span>
        </Expandable>
      );
    }
    case 'map':
      return (
        <Expandable
          label={`Map(${value.size})`}
          preview={<Preview items={value.entries.slice(0, 3).map(([k, v], i) => (
            <span key={i}><ValueView value={k} /> → <ValueView value={v} /></span>
          ))} />}
        >
          <span className="v-list">
            {value.entries.map(([k, v], i) => (
              <span key={i} className="v-row">
                <ValueView value={k} /> → <ValueView value={v} />
              </span>
            ))}
            {value.more > 0 && <span className="v-more">… {value.more} more</span>}
          </span>
        </Expandable>
      );
    case 'set':
      return (
        <Expandable
          label={`Set(${value.size})`}
          preview={<Preview items={value.items.slice(0, 3).map((v, i) => <ValueView key={i} value={v} />)} />}
        >
          <span className="v-list">
            {value.items.map((v, i) => (
              <span key={i} className="v-row">
                <ValueView value={v} />
              </span>
            ))}
            {value.more > 0 && <span className="v-more">… {value.more} more</span>}
          </span>
        </Expandable>
      );
    case 'tbl':
      return (
        <table className="v-table">
          <thead>
            <tr>
              {value.cols.map((c, i) => (
                <th key={i}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {value.rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j}>
                    <ValueView value={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
  }
}
