import { useState, useRef, useCallback, useEffect } from 'react';
import { RunnerService } from '../lib/runner';
import type { ConsoleEntry } from '../types';

export function useRunner() {
  const [entries, setEntries] = useState<ConsoleEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const runnerRef = useRef<RunnerService | null>(null);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    runnerRef.current = new RunnerService();
    return () => {
      runnerRef.current?.destroy();
    };
  }, []);

  const addEntry = useCallback((entry: ConsoleEntry) => {
    setEntries(prev => [...prev, entry]);
  }, []);

  const run = useCallback((code: string, auto = false) => {
    if (auto) {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = window.setTimeout(() => {
        setEntries([]);
        setIsRunning(true);
        runnerRef.current?.execute(code, addEntry);
        setTimeout(() => setIsRunning(false), 100);
      }, 800);
    } else {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      setEntries([]);
      setIsRunning(true);
      runnerRef.current?.execute(code, addEntry);
      setTimeout(() => setIsRunning(false), 100);
    }
  }, [addEntry]);

  const stop = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    runnerRef.current?.stop();
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    runnerRef.current?.reset();
    setEntries([]);
    setIsRunning(false);
  }, []);

  const clear = useCallback(() => {
    setEntries([]);
  }, []);

  return {
    entries,
    isRunning,
    run,
    stop,
    reset,
    clear,
  };
}
