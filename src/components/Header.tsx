import type { Theme } from '../types';
import './Header.css';

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
}

export function Header({ theme, onToggleTheme }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-left">
          <h1 className="header-title">Playground - JavaScript</h1>
      </div>
      <div className="header-right">
        <button
          className="header-btn theme-btn"
          onClick={onToggleTheme}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 1a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-13v2m0 12v2M1 8h2m10 0h2M3.5 3.5l1.4 1.4m6.2 6.2l1.4 1.4M3.5 12.5l1.4-1.4m6.2-6.2l1.4-1.4"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M6 2a6 6 0 1 0 0 12A6 6 0 0 0 6 2zm0 1a5 5 0 1 1 0 10A5 5 0 0 1 6 3z"/>
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
