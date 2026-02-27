import { useState, useEffect, useCallback } from 'react';
import type { Theme } from '../types';
import { getTheme, setTheme as saveTheme } from '../lib/storage';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => getTheme());

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    saveTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  return { theme, toggleTheme };
}
