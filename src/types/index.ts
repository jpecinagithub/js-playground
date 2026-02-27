export interface ConsoleEntry {
  id: string;
  type: 'log' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: number;
  stack?: string;
  styled?: {
    text: string;
    styles: string[];
  };
}

export interface Snippet {
  id: string;
  name: string;
  code: string;
  category?: string;
  topic?: string;
  createdAt: number;
  updatedAt: number;
}

export interface SandboxMessage {
  type: 'log' | 'error' | 'result';
  level?: 'log' | 'info' | 'warn' | 'error';
  args?: unknown[];
  error?: { message: string; stack?: string };
  value?: unknown;
  formatted?: string;
}

export type Theme = 'light' | 'dark';
