import Editor from '@monaco-editor/react';
import type { Theme } from '../types';
import './Editor.css';

interface CodeEditorProps {
  code: string;
  theme: Theme;
  onChange: (value: string) => void;
  onRun: () => void;
  onSave: () => void;
  isRunning: boolean;
  autoRun: boolean;
  onToggleAutoRun: () => void;
  onClear: () => void;
}

export function CodeEditor({
  code,
  theme,
  onChange,
  onRun,
  onSave,
  isRunning,
  autoRun,
  onToggleAutoRun,
  onClear,
}: CodeEditorProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onRun();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      onSave();
    }
  };

  return (
    <div className="editor-panel" onKeyDown={handleKeyDown}>
      <div className="editor-toolbar">
        <div className="editor-actions">
          <button
            className="editor-btn run-btn"
            onClick={onRun}
            disabled={isRunning}
            aria-label="Run code"
          >
            {isRunning ? (
              <>
                <span className="spinner"></span>
                Running
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4 2l10 6-10 6V2z"/>
                </svg>
                Run
              </>
            )}
          </button>
          <button
            className="editor-btn secondary"
            onClick={onClear}
            aria-label="Clear console"
          >
            Clear
          </button>
        </div>
        <div className="editor-toggles">
          <label className="auto-run-toggle">
            <input
              type="checkbox"
              checked={autoRun}
              onChange={onToggleAutoRun}
            />
            <span>Auto-run</span>
          </label>
        </div>
      </div>
      <div className="editor-container">
        <Editor
          height="100%"
          language="javascript"
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          value={code}
          onChange={(value) => onChange(value || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            bracketPairColorization: { enabled: true },
            padding: { top: 12 },
          }}
        />
      </div>
    </div>
  );
}
