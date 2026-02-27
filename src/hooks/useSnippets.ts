import { useState, useCallback, useEffect } from 'react';
import type { Snippet } from '../types';
import { 
  getSnippets, 
  saveSnippet, 
  updateSnippet, 
  deleteSnippet,
  getCurrentCode,
  setCurrentCode
} from '../lib/storage';

export function useSnippets() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);

  const loadSnippets = useCallback(() => {
    setSnippets(getSnippets());
  }, []);

  useEffect(() => {
    loadSnippets();
  }, [loadSnippets]);

  const createSnippet = useCallback((name: string, code: string, category?: string, topic?: string): Snippet => {
    const snippet = saveSnippet({ name, code, category, topic });
    setSnippets(prev => [snippet, ...prev]);
    setCurrentId(snippet.id);
    return snippet;
  }, []);

  const updateCurrentSnippet = useCallback((code: string, name?: string) => {
    if (!currentId) return;
    const updated = updateSnippet(currentId, { code, ...(name && { name }) });
    if (updated) {
      setSnippets(prev => prev.map(s => s.id === currentId ? updated : s));
    }
  }, [currentId]);

  const removeSnippet = useCallback((id: string) => {
    const success = deleteSnippet(id);
    if (success) {
      setSnippets(prev => prev.filter(s => s.id !== id));
      if (currentId === id) {
        setCurrentId(null);
      }
    }
  }, [currentId]);

  const selectSnippet = useCallback((id: string) => {
    const snippet = snippets.find(s => s.id === id);
    if (snippet) {
      setCurrentCode(snippet.code);
      setCurrentId(id);
    }
  }, [snippets]);

  const editSnippet = useCallback((id: string, name: string, code: string, category?: string, topic?: string) => {
    const updated = updateSnippet(id, { name, code, category, topic });
    if (updated) {
      setSnippets(prev => prev.map(s => s.id === id ? updated : s));
    }
  }, []);

  const saveCurrent = useCallback((code: string) => {
    setCurrentCode(code);
    if (currentId) {
      updateCurrentSnippet(code);
    }
  }, [currentId, updateCurrentSnippet]);

  const getCurrentCodeValue = useCallback(() => {
    return getCurrentCode();
  }, []);

  return {
    snippets,
    currentId,
    loadSnippets,
    createSnippet,
    updateCurrentSnippet,
    editSnippet,
    removeSnippet,
    selectSnippet,
    saveCurrent,
    getCurrentCodeValue,
  };
}
