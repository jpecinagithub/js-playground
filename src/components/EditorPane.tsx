import { useEffect, useMemo, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import { StateEffect, StateField } from '@codemirror/state';
import { Decoration } from '@codemirror/view';

/* Line highlight used by the "step by step" mode */
const setStepLine = StateEffect.define<number | null>();
const stepLineField = StateField.define({
  create: () => Decoration.none,
  update(deco, tr) {
    for (const e of tr.effects) {
      if (e.is(setStepLine)) {
        if (e.value == null || e.value < 1) return Decoration.none;
        const lineNo = Math.min(e.value, tr.state.doc.lines);
        const line = tr.state.doc.line(lineNo);
        return Decoration.set([
          Decoration.line({ attributes: { class: 'cm-step-line' } }).range(line.from),
        ]);
      }
    }
    return deco.map(tr.changes);
  },
  provide: (f) => EditorView.decorations.from(f),
});

function buildTheme(dark: boolean) {
  const chrome = EditorView.theme(
    {
      '&': {
        backgroundColor: 'var(--editor-bg)',
        color: 'var(--editor-fg)',
        height: '100%',
      },
      '.cm-content': {
        caretColor: dark ? '#f7df1e' : '#0b5fff',
        fontFamily: 'var(--mono)',
      },
      '.cm-gutters': {
        fontFamily: 'var(--mono)',
        backgroundColor: 'var(--editor-bg)',
        color: dark ? '#5b6472' : '#9aa0a6',
        border: 'none',
      },
      '.cm-scroller': { fontFamily: 'var(--mono)', lineHeight: '1.6' },
      '&.cm-focused': { outline: 'none' },
      '.cm-selectionBackground, ::selection': {
        backgroundColor: dark ? 'rgba(247,223,30,0.22)' : '#bcd6ff',
      },
      '.cm-activeLine': {
        backgroundColor: dark ? 'rgba(255,255,255,0.045)' : 'rgba(0,0,0,0.045)',
      },
      '.cm-activeLineGutter': { backgroundColor: 'transparent' },
      '.cm-step-line': {
        backgroundColor: dark ? 'rgba(247,223,30,0.13)' : 'rgba(247,223,30,0.35)',
        boxShadow: dark ? 'inset 3px 0 0 #f7df1e' : 'inset 3px 0 0 #b89a00',
      },
    },
    { dark },
  );

  const highlight = HighlightStyle.define(
    dark
      ? [
          { tag: tags.comment, color: '#7d8590', fontStyle: 'italic' },
          { tag: [tags.keyword, tags.controlKeyword], color: '#c792ea' },
          { tag: tags.string, color: '#9ece6a' },
          { tag: tags.number, color: '#ff9e64' },
          { tag: tags.bool, color: '#ff9e64' },
          { tag: [tags.function(tags.variableName)], color: '#7aa2f7' },
          { tag: tags.variableName, color: '#e6edf3' },
          { tag: tags.propertyName, color: '#e6edf3' },
          { tag: [tags.typeName, tags.className], color: '#2ac3de' },
          { tag: tags.operator, color: '#89ddff' },
          { tag: tags.bracket, color: '#8b949e' },
          { tag: tags.punctuation, color: '#8b949e' },
        ]
      : [
          { tag: tags.comment, color: '#8a919c', fontStyle: 'italic' },
          { tag: [tags.keyword, tags.controlKeyword], color: '#7c3aed' },
          { tag: tags.string, color: '#047857' },
          { tag: tags.number, color: '#b45309' },
          { tag: tags.bool, color: '#b45309' },
          { tag: [tags.function(tags.variableName)], color: '#1d4ed8' },
          { tag: tags.variableName, color: '#111827' },
          { tag: tags.propertyName, color: '#334155' },
          { tag: [tags.typeName, tags.className], color: '#0e7490' },
          { tag: tags.operator, color: '#374151' },
          { tag: tags.bracket, color: '#6b7280' },
          { tag: tags.punctuation, color: '#6b7280' },
        ],
  );

  return [chrome, syntaxHighlighting(highlight)];
}

export function EditorPane({
  code,
  onChange,
  fontSize,
  dark,
  stepLine,
  readOnly,
}: {
  code: string;
  onChange: (v: string) => void;
  fontSize: number;
  dark: boolean;
  stepLine: number | null;
  readOnly?: boolean;
}) {
  const viewRef = useRef<EditorView | null>(null);

  const fontTheme = useMemo(
    () =>
      EditorView.theme({
        '&': { fontSize: `${fontSize}px` },
      }),
    [fontSize],
  );

  const themeExt = useMemo(() => buildTheme(dark), [dark]);

  const extensions = useMemo(
    () => [javascript({ jsx: false, typescript: false }), themeExt, fontTheme, stepLineField, EditorView.lineWrapping],
    [themeExt, fontTheme],
  );

  useEffect(() => {
    viewRef.current?.dispatch({ effects: setStepLine.of(stepLine) });
  }, [stepLine]);

  return (
    <div className="editor-wrap">
      <CodeMirror
        value={code}
        height="100%"
        extensions={extensions}
        onChange={onChange}
        readOnly={!!readOnly}
        basicSetup={{
          lineNumbers: true,
          foldGutter: false,
          highlightActiveLine: true,
          highlightActiveLineGutter: true,
          tabSize: 2,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
        }}
        onCreateEditor={(view) => {
          viewRef.current = view;
          if (stepLine != null) view.dispatch({ effects: setStepLine.of(stepLine) });
        }}
      />
    </div>
  );
}
