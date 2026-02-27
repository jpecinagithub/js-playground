import { useRef, useEffect } from 'react';
import type { ConsoleEntry } from '../types';
import './Console.css';

interface ConsoleProps {
  entries: ConsoleEntry[];
  onClear: () => void;
}

export function Console({ entries, onClear }: ConsoleProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [entries]);

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const renderMessage = (entry: ConsoleEntry) => {
    if (entry.styled && entry.styled.styles.length > 0) {
      return (
        <span 
          className="console-message" 
          style={{ 
            display: 'inline',
            background: entry.styled.styles[0].includes('background') 
              ? entry.styled.styles[0].match(/background:\s*([^;]+)/)?.[1] || undefined 
              : undefined,
            color: entry.styled.styles[0].match(/color:\s*([^;]+)/)?.[1] || 'inherit',
            fontSize: entry.styled.styles[0].match(/font-size:\s*([^;]+)/)?.[1] || 'inherit',
            fontWeight: entry.styled.styles[0].includes('font-weight') ? 'bold' : 'normal',
            padding: entry.styled.styles[0].includes('padding') ? '4px' : '0',
            borderRadius: entry.styled.styles[0].includes('background') ? '3px' : '0',
          }}
        >
          {entry.styled.text}
        </span>
      );
    }
    return <span className="console-message">{entry.message}</span>;
  };

  return (
    <div className="console-panel">
      <div className="console-header">
        <span className="console-title">Console</span>
        {entries.length > 0 && (
          <button
            className="console-clear"
            onClick={onClear}
            aria-label="Clear console"
          >
            Clear
          </button>
        )}
      </div>
      <div className="console-output" ref={containerRef}>
        {entries.length === 0 ? (
          <div className="console-empty">
            Run your code to see output here
          </div>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className={`console-entry console-${entry.type}`}>
              <span className="console-time">{formatTime(entry.timestamp)}</span>
              <span className="console-icon">
                {entry.type === 'log' && '›'}
                {entry.type === 'info' && 'i'}
                {entry.type === 'warn' && '⚠'}
                {entry.type === 'error' && '✕'}
              </span>
              {renderMessage(entry)}
              {entry.stack && (
                <pre className="console-stack">{entry.stack}</pre>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
