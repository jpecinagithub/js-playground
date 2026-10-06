import { useCallback, useEffect, useRef, useState } from 'react';
import { STR, LANGS, type Lang } from './i18n';
import { DEFAULT_CODE, templateById, type Template } from './templates';
import { STEPS } from './steps';
import { executeCode, ReplSession, type ReplOutput } from './exec/runner';
import type { LogMsg, Ser } from './exec/types';
import { store, buildShareUrl, decodeSharedCode, sharedCodeParam } from './share';
import { analytics } from './analytics';
import { Landing } from './components/Landing';
import { EditorPane } from './components/EditorPane';
import { ConsolePane, type LogEntry, type ReplEntry } from './components/ConsolePane';
import { ExamplesPanel } from './components/ExamplesPanel';
import { StepByStepModal } from './components/StepByStep';

type View = 'landing' | 'playground';
type ThemePref = 'light' | 'dark' | 'system';

const isMobileView = () =>
  typeof window !== 'undefined' && window.matchMedia('(max-width: 820px)').matches;

export default function App() {
  const [view, setView] = useState<View>(() => (sharedCodeParam() ? 'playground' : 'landing'));
  const [lang, setLang] = useState<Lang>(() => (store.get('lang') as Lang) || 'en');
  const [themePref, setThemePref] = useState<ThemePref>(() => (store.get('theme') as ThemePref) || 'system');
  const [systemDark, setSystemDark] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : false,
  );
  const dark = themePref === 'dark' || (themePref === 'system' && systemDark);

  const [code, setCode] = useState<string>(() => store.get('code') ?? DEFAULT_CODE);
  const [templateId, setTemplateId] = useState<string | null>(() => store.get('template'));
  const [banner, setBanner] = useState<Template | null>(() => templateById(store.get('template')) ?? null);

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [vars, setVars] = useState<Array<[string, Ser]>>([]);
  const [running, setRunning] = useState(false);
  const [timeoutNote, setTimeoutNote] = useState(false);
  const [asyncCutoff, setAsyncCutoff] = useState(false);
  const [lastDuration, setLastDuration] = useState<number | null>(null);
  const [consoleTab, setConsoleTab] = useState<'console' | 'variables'>('console');

  const [split, setSplit] = useState(() => Number(store.get('split')) || 0.5);
  const [fontSize, setFontSize] = useState(() => Number(store.get('fontSize')) || 14);
  const [mobileTab, setMobileTab] = useState<'code' | 'result'>('code');

  const [examplesOpen, setExamplesOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [stepsOpen, setStepsOpen] = useState(false);
  const [stepLine, setStepLine] = useState<number | null>(null);

  const [toast, setToast] = useState<string | null>(null);
  const [replEntries, setReplEntries] = useState<ReplEntry[]>([]);
  const [replBusy, setReplBusy] = useState(false);

  const d = STR[lang];
  const logSeq = useRef(0);
  const runHandle = useRef<{ cancel: () => void } | null>(null);
  const replRef = useRef<ReplSession | null>(null);
  const openedOnce = useRef(false);
  const codeRef = useRef(code);
  codeRef.current = code;

  /* ------------------------------ effects ------------------------------ */

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }, [lang, dark]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const h = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  useEffect(() => store.set('lang', lang), [lang]);
  useEffect(() => store.set('theme', themePref), [themePref]);
  useEffect(() => store.set('fontSize', String(fontSize)), [fontSize]);
  useEffect(() => store.set('split', String(split)), [split]);
  useEffect(() => store.set('template', templateId ?? ''), [templateId]);

  useEffect(() => {
    const t = setTimeout(() => store.set('code', code), 400);
    return () => clearTimeout(t);
  }, [code]);

  useEffect(() => {
    if (toast == null) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  // Load shared code from ?code= once
  useEffect(() => {
    const param = sharedCodeParam();
    if (!param) return;
    decodeSharedCode(param).then((src) => {
      if (src != null) {
        setCode(src);
        setTemplateId(null);
        setBanner(null);
        setToast(STR[lang].status.fromLink);
        window.history.replaceState(null, '', location.pathname);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // REPL session lifecycle
  useEffect(() => {
    const s = new ReplSession();
    s.onOutput = (out: ReplOutput) => {
      setReplEntries((p) => [...p.slice(-49), { id: out.id, input: out.input, logs: out.logs, result: out.result }]);
      setReplBusy(false);
    };
    s.onSessionReset = () => {
      setReplBusy(false);
      setReplEntries((p) => [
        ...p.slice(-49),
        { id: ++logSeq.current, input: '', logs: [], result: { k: 'other', v: STR[lang].console_.replRestarted } },
      ]);
    };
    replRef.current = s;
    return () => s.dispose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------------------ actions ------------------------------ */

  const clearConsole = useCallback(() => {
    setLogs([]);
    setTimeoutNote(false);
    setAsyncCutoff(false);
  }, []);

  const run = useCallback(() => {
    if (view !== 'playground') return;
    runHandle.current?.cancel();
    setLogs([]);
    setVars([]);
    setTimeoutNote(false);
    setAsyncCutoff(false);
    setLastDuration(null);
    setConsoleTab('console');
    setRunning(true);
    if (isMobileView()) setMobileTab('result');
    analytics.run();
    runHandle.current = executeCode(code, {
      onLog: (log: LogMsg) => {
        if (log.method === 'clear') {
          setLogs([]);
          return;
        }
        const id = ++logSeq.current;
        setLogs((p) => [...p.slice(-499), { id, method: log.method, args: log.args }]);
      },
      onDone: ({ vars: v, asyncCutoff: ac, durationMs }) => {
        setVars(v);
        setAsyncCutoff(ac);
        setLastDuration(durationMs);
        setRunning(false);
      },
      onTimeout: () => {
        setTimeoutNote(true);
        setRunning(false);
      },
    });
  }, [code, view]);

  useEffect(() => () => runHandle.current?.cancel(), []);

  const saveNow = useCallback(() => {
    store.set('code', codeRef.current);
    setToast(STR[lang].status.saved);
  }, [lang]);

  const actionsRef = useRef({ run, clearConsole, saveNow });
  actionsRef.current = { run, clearConsole, saveNow };
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const k = e.key.toLowerCase();
      if (k === 'enter') {
        e.preventDefault();
        actionsRef.current.run();
      } else if (k === 'l') {
        e.preventDefault();
        actionsRef.current.clearConsole();
      } else if (k === 's') {
        e.preventDefault();
        actionsRef.current.saveNow();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const selectTemplate = (t: Template) => {
    runHandle.current?.cancel();
    setRunning(false);
    setCode(t.code);
    setTemplateId(t.id);
    setBanner(t);
    clearConsole();
    setVars([]);
    setExamplesOpen(false);
    if (isMobileView()) setMobileTab('code');
    analytics.template(t.id);
  };

  const resetCode = () => {
    const t = templateById(templateId);
    setCode(t ? t.code : DEFAULT_CODE);
    setToast(d.toolbar.restored);
  };

  const newPlayground = () => {
    runHandle.current?.cancel();
    setRunning(false);
    setCode(DEFAULT_CODE);
    setTemplateId(null);
    setBanner(null);
    clearConsole();
    setVars([]);
    if (isMobileView()) setMobileTab('code');
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setToast(d.toolbar.copied);
    } catch {
      setToast(d.toolbar.copied);
    }
  };

  const shareCode = async () => {
    const url = await buildShareUrl(code);
    if (!url) {
      setToast(d.toolbar.shareTooLong);
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setToast(d.toolbar.shareCopied);
    } catch {
      setToast(url);
    }
  };

  const openPlayground = () => {
    setView('playground');
    if (!openedOnce.current) {
      openedOnce.current = true;
      analytics.open();
    }
  };

  const changeLang = (l: Lang) => {
    setLang(l);
    analytics.language(l);
  };

  /* ------------------------------ render ------------------------------ */

  if (view === 'landing') {
    return (
      <div className="app" data-view="landing">
        <div className="lang-float">
          {LANGS.map((l) => (
            <button key={l} type="button" className={l === lang ? 'active' : ''} onClick={() => changeLang(l)}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
        <Landing d={d} onStart={openPlayground} />
      </div>
    );
  }

  const steps = templateId ? STEPS[templateId] : undefined;

  return (
    <div className="app" data-view="playground">
      <header className="topbar">
        <button type="button" className="logo" onClick={() => setView('landing')} title={d.landing.title}>
          <span className="logo-mark">&gt;_</span>
          <span className="logo-text">JavaScript Playground</span>
        </button>
        <div className="topbar-right">
          <div className="lang-seg" role="group" aria-label="Language">
            {LANGS.map((l) => (
              <button key={l} type="button" className={l === lang ? 'active' : ''} onClick={() => changeLang(l)}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <button type="button" className="btn ghost sm" onClick={() => setExamplesOpen(true)}>
            ≡ {d.header.examples}
          </button>
          <a
            className="icon-btn link"
            href="https://github.com/jpecinagithub/js-playground"
            target="_blank"
            rel="noreferrer"
            title={d.header.github}
            aria-label={d.header.github}
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
            </svg>
          </a>
          <div className="settings-wrap">
            <button
              type="button"
              className="icon-btn"
              onClick={() => setSettingsOpen((o) => !o)}
              aria-label={d.header.settings}
              title={d.header.settings}
            >
              ⚙
            </button>
            {settingsOpen && (
              <div className="popover" role="dialog" aria-label={d.settings.title}>
                <h4>{d.settings.title}</h4>
                <div className="pop-row">
                  <span>{d.settings.theme}</span>
                  <div className="lang-seg">
                    {(['system', 'light', 'dark'] as const).map((t) => (
                      <button key={t} type="button" className={themePref === t ? 'active' : ''} onClick={() => setThemePref(t)}>
                        {d.settings[t]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="pop-row">
                  <span>{d.settings.fontSize}</span>
                  <div className="font-ctl">
                    <button type="button" className="icon-btn" onClick={() => setFontSize((f) => Math.max(11, f - 1))} aria-label={d.editor.decrease}>A−</button>
                    <span className="font-val">{fontSize}px</span>
                    <button type="button" className="icon-btn" onClick={() => setFontSize((f) => Math.min(22, f + 1))} aria-label={d.editor.increase}>A+</button>
                  </div>
                </div>
                <div className="pop-shortcuts">
                  <h5>{d.shortcuts.title}</h5>
                  <div><kbd>Ctrl</kbd>+<kbd>Enter</kbd> {d.shortcuts.run}</div>
                  <div><kbd>Ctrl</kbd>+<kbd>L</kbd> {d.shortcuts.clear}</div>
                  <div><kbd>Ctrl</kbd>+<kbd>S</kbd> {d.shortcuts.save}</div>
                </div>
                <button type="button" className="btn ghost sm" onClick={() => setSettingsOpen(false)}>
                  {d.settings.close}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="mobile-tabs">
        <button type="button" className={mobileTab === 'code' ? 'active' : ''} onClick={() => setMobileTab('code')}>
          {d.editor.code}
        </button>
        <button type="button" className={mobileTab === 'result' ? 'active' : ''} onClick={() => setMobileTab('result')}>
          {d.editor.result}
        </button>
      </div>

      <main className="panes" data-mobile-tab={mobileTab}>
        <section className="pane editor-pane" style={{ flexGrow: split, flexBasis: 0 }}>
          {banner && (
            <div className="tpl-banner">
              <div className="tpl-banner-text">
                <strong>{banner.name[lang]}</strong>
                <span>{banner.explanation[lang]}</span>
              </div>
              {steps && (
                <button type="button" className="btn ghost sm" onClick={() => setStepsOpen(true)}>
                  ◷ {d.steps.button}
                </button>
              )}
              <button type="button" className="icon-btn" onClick={() => setBanner(null)} aria-label={d.examples.close}>
                ✕
              </button>
            </div>
          )}
          <div className="editor-tools">
            <span className="editor-tools-label">{d.editor.code}</span>
            <span className="spacer" />
            <button type="button" className="icon-btn" onClick={() => setFontSize((f) => Math.max(11, f - 1))} title={d.editor.decrease} aria-label={d.editor.decrease}>A−</button>
            <button type="button" className="icon-btn" onClick={() => setFontSize((f) => Math.min(22, f + 1))} title={d.editor.increase} aria-label={d.editor.increase}>A+</button>
            <button type="button" className="icon-btn" onClick={resetCode} title={d.toolbar.reset} aria-label={d.toolbar.reset}>↺</button>
            <button type="button" className="icon-btn" onClick={() => setCode('')} title={d.toolbar.clear} aria-label={d.toolbar.clear}>🗑</button>
          </div>
          <EditorPane code={code} onChange={setCode} fontSize={fontSize} dark={dark} stepLine={stepLine} />
        </section>

        <div
          className="splitter"
          role="separator"
          aria-orientation="vertical"
          onPointerDown={(e) => {
            e.preventDefault();
            const el = (e.currentTarget as HTMLElement).parentElement!;
            const move = (ev: PointerEvent) => {
              const r = el.getBoundingClientRect();
              const ratio = (ev.clientX - r.left) / r.width;
              setSplit(Math.min(0.8, Math.max(0.2, ratio)));
            };
            const up = () => {
              window.removeEventListener('pointermove', move);
              window.removeEventListener('pointerup', up);
            };
            window.addEventListener('pointermove', move);
            window.addEventListener('pointerup', up);
          }}
        />

        <section className="pane console-pane-wrap" style={{ flexGrow: 1 - split, flexBasis: 0 }}>
          <ConsolePane
            d={d}
            logs={logs}
            vars={vars}
            timeoutNote={timeoutNote}
            asyncCutoff={asyncCutoff}
            replEntries={replEntries}
            replBusy={replBusy}
            onReplSubmit={(input) => {
              setReplBusy(true);
              replRef.current?.eval(input);
            }}
            onTabChange={setConsoleTab}
            activeTab={consoleTab}
          />
        </section>
      </main>

      <footer className="actionbar">
        <button type="button" className="btn primary run" onClick={run} disabled={running}>
          {running ? '… ' + d.status.running : '▶ ' + d.toolbar.run}
        </button>
        <button type="button" className="btn ghost" onClick={clearConsole}>🧹 {d.toolbar.clear}</button>
        <button type="button" className="btn ghost" onClick={resetCode}>↺ {d.toolbar.reset}</button>
        <button type="button" className="btn ghost" onClick={copyCode}>⧉ {d.toolbar.copy}</button>
        <button type="button" className="btn ghost" onClick={shareCode}>🔗 {d.toolbar.share}</button>
        <button type="button" className="btn ghost" onClick={newPlayground}>＋ {d.toolbar.new_}</button>
        <span className="spacer" />
        <span className="status">
          <span className={`dot${running ? ' busy' : ''}`} />
          {running ? d.status.running : d.status.ready}
          {lastDuration != null && !running && <span className="duration"> · {lastDuration} ms</span>}
        </span>
        <span className="kbd-hint hide-mobile">
          <kbd>Ctrl</kbd>+<kbd>Enter</kbd>
        </span>
      </footer>

      <footer className="credit">
        <span>{d.about.createdBy}</span>
        <span className="credit-dot">·</span>
        <span className="credit-purpose" title={d.about.purpose}>{d.about.purpose}</span>
        <span className="credit-dot">·</span>
        <a href="mailto:jpecina@gmail.com">{d.about.contact}</a>
      </footer>

      {examplesOpen && (
        <ExamplesPanel
          lang={lang}
          d={d}
          activeId={templateId}
          onSelect={selectTemplate}
          onClose={() => setExamplesOpen(false)}
        />
      )}
      <StepByStepModal
        lang={lang}
        d={d}
        steps={steps ?? []}
        open={stepsOpen && !!steps}
        onClose={() => setStepsOpen(false)}
        onStepLine={setStepLine}
      />
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
