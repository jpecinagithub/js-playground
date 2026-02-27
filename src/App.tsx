import { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { CodeEditor } from './components/CodeEditor';
import { Console } from './components/Console';
import { SnippetSidebar } from './components/SnippetSidebar';
import { SnippetModal } from './components/SnippetModal';
import { useTheme } from './hooks/useTheme';
import { useRunner } from './hooks/useRunner';
import { useSnippets } from './hooks/useSnippets';
import { getCodeFromUrl } from './lib/share';
import './index.css';

function App() {
  const { theme, toggleTheme } = useTheme();
  const { entries, isRunning, run, clear: clearConsole } = useRunner();
  const {
    snippets,
    currentId,
    createSnippet,
    editSnippet,
    selectSnippet,
    saveCurrent,
    getCurrentCodeValue,
  } = useSnippets();

  const [code, setCode] = useState('');
  const [autoRun, setAutoRun] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileTab, setMobileTab] = useState<'editor' | 'console'>('editor');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'save' | 'new' | 'edit'>('save');
  const [editingSnippet, setEditingSnippet] = useState<{ id: string; name: string; code: string; category?: string; topic?: string } | null>(null);
  
  const [leftWidth, setLeftWidth] = useState(50);
  const [isDraggingPanel, setIsDraggingPanel] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const urlCode = getCodeFromUrl();
    if (urlCode) {
      setCode(urlCode);
      createSnippet('Shared Snippet', urlCode);
    } else {
      setCode(getCurrentCodeValue());
    }
  }, [createSnippet, getCurrentCodeValue]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;
    
    if (isDraggingPanel) {
      const rect = containerRef.current.getBoundingClientRect();
      const sidebarW = sidebarOpen ? 280 : 0;
      const newLeftWidth = ((e.clientX - rect.left - sidebarW) / (rect.width - sidebarW)) * 100;
      setLeftWidth(Math.max(20, Math.min(80, newLeftWidth)));
    }
  }, [isDraggingPanel, sidebarOpen]);

  const handleMouseUp = useCallback(() => {
    setIsDraggingPanel(false);
  }, []);

  useEffect(() => {
    if (isDraggingPanel) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDraggingPanel, handleMouseMove, handleMouseUp]);

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
    saveCurrent(newCode);
    if (autoRun) {
      run(newCode, true);
    }
  }, [autoRun, run, saveCurrent]);

  const handleRun = useCallback(() => {
    run(code, false);
  }, [code, run]);

  const handleSaveClick = useCallback(() => {
    if (!currentId) {
      setModalMode('save');
      setModalOpen(true);
    } else {
      saveCurrent(code);
    }
  }, [currentId, saveCurrent, code]);

  const handleNewSnippet = useCallback(() => {
    setModalMode('new');
    setEditingSnippet(null);
    setModalOpen(true);
  }, []);

  const handleEditSnippet = useCallback((id: string) => {
    const snippet = snippets.find(s => s.id === id);
    if (snippet) {
      setModalMode('edit');
      setEditingSnippet({ id: snippet.id, name: snippet.name, code: snippet.code, category: snippet.category, topic: snippet.topic });
      setModalOpen(true);
    }
  }, [snippets]);

  const handleModalSave = useCallback((name: string, snippetCode: string, category?: string, topic?: string) => {
    if (modalMode === 'edit' && editingSnippet) {
      editSnippet(editingSnippet.id, name, snippetCode, category, topic);
    } else {
      const snippet = createSnippet(name, snippetCode, category, topic);
      setCode(snippet.code);
    }
    setEditingSnippet(null);
  }, [modalMode, editingSnippet, editSnippet, createSnippet]);

  const handleClear = useCallback(() => {
    setCode('');
    clearConsole();
    saveCurrent('');
  }, [clearConsole, saveCurrent]);

  return (
    <div className="app">
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <div className="mobile-tabs">
        <button
          className={`mobile-tab ${mobileTab === 'editor' ? 'active' : ''}`}
          onClick={() => setMobileTab('editor')}
        >
          Editor
        </button>
        <button
          className={`mobile-tab ${mobileTab === 'console' ? 'active' : ''}`}
          onClick={() => setMobileTab('console')}
        >
          Console
        </button>
      </div>
      <main className="main-content" ref={containerRef}>
        {sidebarOpen && (
          <aside className="sidebar-pane">
            <SnippetSidebar
              snippets={snippets}
              currentId={currentId}
              onSelect={(id) => {
                selectSnippet(id);
                setCode(snippets.find(s => s.id === id)?.code || '');
              }}
              onEdit={handleEditSnippet}
              onNew={handleNewSnippet}
              isOpen={true}
              onClose={() => setSidebarOpen(false)}
              showOverlay={false}
            />
          </aside>
        )}
        <div className={`panels ${mobileTab === 'editor' ? 'editor-active' : 'console-active'}`}>
          <div className="editor-pane" style={{ width: `${leftWidth}%` }}>
            <CodeEditor
              code={code}
              theme={theme}
              onChange={handleCodeChange}
              onRun={handleRun}
              onSave={handleSaveClick}
              isRunning={isRunning}
              autoRun={autoRun}
              onToggleAutoRun={() => setAutoRun(!autoRun)}
              onClear={handleClear}
            />
          </div>
          <div 
            className="resizer resizer-panel"
            onMouseDown={() => setIsDraggingPanel(true)}
          />
          <div className="console-pane" style={{ width: `${100 - leftWidth}%` }}>
            <Console
              entries={entries}
              onClear={clearConsole}
            />
          </div>
        </div>
      </main>
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle snippets"
      >
        ☰
      </button>
      <SnippetModal
        isOpen={modalOpen}
        mode={modalMode}
        initialName={editingSnippet?.name}
        initialCode={editingSnippet?.code || (modalMode === 'new' ? code : '')}
        initialCategory={editingSnippet?.category}
        initialTopic={editingSnippet?.topic}
        onClose={() => {
          setModalOpen(false);
          setEditingSnippet(null);
        }}
        onSave={handleModalSave}
      />
    </div>
  );
}

export default App;
