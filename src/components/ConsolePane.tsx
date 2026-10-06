import { useEffect, useRef, useState } from 'react';
import type { LogMethod, Ser } from '../exec/types';
import type { Dict } from '../i18n';
import { ValueView } from './ValueView';

export interface LogEntry {
  id: number;
  method: LogMethod;
  args: Ser[];
}

export interface ReplEntry {
  id: number;
  input: string;
  logs: { method: LogMethod; args: Ser[] }[];
  result: Ser;
}

function ErrorBlock({ value, lineLabel }: { value: Extract<Ser, { k: 'err' }>; lineLabel: string }) {
  return (
    <div className="err-block">
      <div className="err-name">
        ⚠ {value.name}: {value.msg || '(no message)'}
      </div>
      {value.line != null && (
        <div className="err-line">
          {lineLabel} {value.line}
        </div>
      )}
    </div>
  );
}

function TimeoutBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="err-block timeout">
      <div className="err-name">⚠ {title}</div>
      <div className="err-line">{body}</div>
    </div>
  );
}

function LogLine({ entry, lineLabel }: { entry: LogEntry; lineLabel: string }) {
  if (entry.method === 'clear') return null;
  const cls = `log-line m-${entry.method}`;
  return (
    <div className={cls}>
      <span className="log-gutter">{entry.method === 'error' ? '✕' : '›'}</span>
      <span className="log-body">
        {entry.args.length === 0 && <span className="v-nil">(no output)</span>}
        {entry.args.map((a, i) =>
          a.k === 'err' && entry.method === 'error' ? (
            <ErrorBlock key={i} value={a} lineLabel={lineLabel} />
          ) : (
            <span key={i} className="log-arg">
              <ValueView value={a} />
            </span>
          ),
        )}
      </span>
    </div>
  );
}

export function ConsolePane({
  d,
  logs,
  vars,
  timeoutNote,
  asyncCutoff,
  replEntries,
  replBusy,
  onReplSubmit,
  onTabChange,
  activeTab,
}: {
  d: Dict;
  logs: LogEntry[];
  vars: Array<[string, Ser]>;
  timeoutNote: boolean;
  asyncCutoff: boolean;
  replEntries: ReplEntry[];
  replBusy: boolean;
  onReplSubmit: (input: string) => void;
  onTabChange: (tab: 'console' | 'variables') => void;
  activeTab: 'console' | 'variables';
}) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef(true);

  useEffect(() => {
    const el = scrollRef.current;
    if (el && stickRef.current) el.scrollTop = el.scrollHeight;
  }, [logs, replEntries, timeoutNote, asyncCutoff, activeTab]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
  };

  const submit = () => {
    const v = input.trim();
    if (!v || replBusy) return;
    setHistory((h) => [v, ...h].slice(0, 50));
    setHistIdx(-1);
    setInput('');
    onReplSubmit(v);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submit();
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const ni = Math.min(histIdx + 1, history.length - 1);
      if (history[ni]) {
        setHistIdx(ni);
        setInput(history[ni]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const ni = histIdx - 1;
      setHistIdx(ni);
      setInput(ni >= 0 ? history[ni] : '');
    }
  };

  return (
    <div className="console-pane">
      <div className="pane-tabs">
        <button
          type="button"
          className={activeTab === 'console' ? 'active' : ''}
          onClick={() => onTabChange('console')}
        >
          {d.console_.console}
        </button>
        <button
          type="button"
          className={activeTab === 'variables' ? 'active' : ''}
          onClick={() => onTabChange('variables')}
        >
          {d.console_.variables}
          {vars.length > 0 && <span className="tab-count">{vars.length}</span>}
        </button>
      </div>

      {activeTab === 'console' ? (
        <>
          <div className="log-scroll" ref={scrollRef} onScroll={onScroll}>
            {logs.length === 0 && !timeoutNote ? (
              <div className="log-empty">{d.console_.empty}</div>
            ) : (
              logs.map((e) => <LogLine key={e.id} entry={e} lineLabel={d.errors.line} />)
            )}
            {timeoutNote && <TimeoutBlock title={d.errors.timeoutTitle} body={d.errors.timeoutBody} />}
            {asyncCutoff && <div className="log-note">⏳ {d.console_.asyncCutoff}</div>}

            {replEntries.length > 0 && (
              <div className="repl-history">
                {replEntries.map((r) =>
                  r.input === '' ? (
                    <div key={r.id} className="log-note">
                      {r.result.k === 'other' ? r.result.v : '—'}
                    </div>
                  ) : (
                  <div key={r.id} className="repl-entry">
                    <div className="repl-in">
                      <span className="log-gutter">&gt;</span>
                      <code>{r.input}</code>
                    </div>
                    {r.logs.map((l, i) => (
                      <div key={i} className={`log-line m-${l.method}`}>
                        <span className="log-gutter">›</span>
                        <span className="log-body">
                          {l.args.map((a, j) => (
                            <span key={j} className="log-arg">
                              <ValueView value={a} />
                            </span>
                          ))}
                        </span>
                      </div>
                    ))}
                    <div className="repl-out">
                      <span className="log-gutter">←</span>
                      <span className="log-body">
                        {r.result.k === 'err' ? (
                          <ErrorBlock value={r.result} lineLabel={d.errors.line} />
                        ) : (
                          <ValueView value={r.result} />
                        )}
                      </span>
                    </div>
                  </div>
                  ),
                )}
              </div>
            )}
          </div>
          <div className="repl-bar" title={d.console_.replHint}>
            <span className="repl-prompt">&gt;</span>
            <input
              className="repl-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={d.console_.replPlaceholder}
              aria-label="REPL"
              disabled={replBusy}
              spellCheck={false}
              autoComplete="off"
            />
            {replBusy && <span className="repl-spinner" />}
          </div>
        </>
      ) : (
        <div className="log-scroll" onScroll={onScroll}>
          {vars.length === 0 ? (
            <div className="log-empty">{d.variables.empty}</div>
          ) : (
            <table className="vars-table">
              <thead>
                <tr>
                  <th>{d.variables.name}</th>
                  <th>{d.variables.value}</th>
                </tr>
              </thead>
              <tbody>
                {vars.map(([name, v], i) => (
                  <tr key={i}>
                    <td className="vars-name">
                      <code>{name}</code>
                    </td>
                    <td>
                      <ValueView value={v} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
