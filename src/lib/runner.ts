import type { SandboxMessage, ConsoleEntry } from '../types';
import { v4 as uuidv4 } from 'uuid';

const SANDBOX_TIMEOUT = 5000;

export class RunnerService {
  private iframe: HTMLIFrameElement | null = null;
  private messageHandler: ((entry: ConsoleEntry) => void) | null = null;
  private timeoutId: number | null = null;
  private isRunning = false;

  constructor() {
    this.createSandbox();
  }

  private createSandbox(): void {
    if (this.iframe) {
      this.iframe.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.sandbox.add('allow-scripts');
    iframe.style.display = 'none';
    iframe.src = 'about:blank';
    document.body.appendChild(iframe);
    this.iframe = iframe;

    window.addEventListener('message', this.handleMessage);
  }

  private handleMessage = (event: MessageEvent<SandboxMessage>): void => {
    if (event.source !== this.iframe?.contentWindow) return;
    if (!this.messageHandler) return;

    const data = event.data;

    if (data.type === 'result') {
      this.isRunning = false;
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }
      return;
    }

    if (data.type === 'log' && data.args) {
      let message = data.args.map(arg => this.stringify(arg)).join(' ');
      let styledData: { text: string; styles: string[] } | undefined;
      
      if (data.formatted && data.formatted.startsWith('{')) {
        try {
          const parsed = JSON.parse(data.formatted);
          if (parsed && parsed.text) {
            styledData = parsed;
            message = parsed.text;
          }
        } catch {}
      }
      
      const entry: ConsoleEntry = {
        id: uuidv4(),
        type: data.level || 'log',
        message,
        timestamp: Date.now(),
      };
      if (styledData) {
        entry.styled = styledData;
      }
      this.messageHandler(entry);
    } else if (data.type === 'error' && data.error) {
      this.isRunning = false;
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }
      const entry: ConsoleEntry = {
        id: uuidv4(),
        type: 'error',
        message: data.error.message,
        timestamp: Date.now(),
        stack: data.error.stack,
      };
      this.messageHandler(entry);
    }
  };

  private stringify(value: unknown): string {
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    if (typeof value === 'string') return value;
    if (typeof value === 'function') return '[Function]';
    
    try {
      const seen = new WeakSet();
      return JSON.stringify(value, (_key, val) => {
        if (typeof val === 'object' && val !== null) {
          if (seen.has(val)) return '[Circular]';
          seen.add(val);
        }
        return val;
      }, 2);
    } catch {
      return String(value);
    }
  }

  execute(code: string, onLog: (entry: ConsoleEntry) => void): void {
    if (!this.iframe) {
      this.createSandbox();
    }

    this.messageHandler = onLog;
    this.isRunning = true;

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    const sandboxCode = `
      <!DOCTYPE html>
      <html>
      <head>
        <script>
          (function() {
            const originalConsole = {
              log: console.log,
              info: console.info,
              warn: console.warn,
              error: console.error
            };

            function safeStringify(val) {
              if (val === undefined) return 'undefined';
              if (val === null) return 'null';
              if (typeof val === 'string') return val;
              if (typeof val === 'function') return '[Function]';
              try {
                const seen = new WeakSet();
                return JSON.stringify(val, function(_k, v) {
                  if (typeof v === 'object' && v !== null) {
                    if (seen.has(v)) return '[Circular]';
                    seen.add(v);
                  }
                  return v;
                }, 2);
              } catch {
                return String(v);
              }
            }

            function formatWithStyles(args) {
              if (args.length === 0) return '';
              
              const message = args[0];
              if (typeof message !== 'string' || !message.includes('%c')) {
                return args.map(safeStringify).join(' ');
              }
              
              let result = '';
              let styleIndex = 1;
              let styles = [];
              
              const parts = message.split(/(\%c)/g);
              let hasStyle = false;
              
              for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                if (part === '%c') {
                  hasStyle = true;
                  styles.push(args[styleIndex] || '');
                  styleIndex++;
                } else if (part) {
                  result += part;
                }
              }
              
              if (hasStyle && styles.length > 0) {
                return JSON.stringify({ text: result, styles: styles });
              }
              
              return args.map(safeStringify).join(' ');
            }

            ['log', 'info', 'warn', 'error'].forEach(function(method) {
              console[method] = function() {
                const formatted = formatWithStyles(Array.from(arguments));
                const args = Array.from(arguments).map(safeStringify);
                parent.postMessage({
                  type: 'log',
                  level: method,
                  args: args,
                  formatted: formatted
                }, '*');
                originalConsole[method].apply(console, arguments);
              };
            });

            window.onerror = function(message, source, lineno, colno, error) {
              parent.postMessage({
                type: 'error',
                error: {
                  message: String(message),
                  stack: error?.stack
                }
              }, '*');
            };

            window.onunhandledrejection = function(event) {
              parent.postMessage({
                type: 'error',
                error: {
                  message: 'Unhandled Promise Rejection: ' + event.reason,
                  stack: event.reason?.stack
                }
              }, '*');
            };

            try {
              ${code}
              parent.postMessage({ type: 'result', value: undefined }, '*');
            } catch(e) {
              parent.postMessage({
                type: 'error',
                error: {
                  message: e.message,
                  stack: e.stack
                }
              }, '*');
            }
          })();
        <\/script>
      </head>
      <body></body>
      </html>
    `;

    this.iframe!.srcdoc = sandboxCode;

    this.timeoutId = window.setTimeout(() => {
      if (this.isRunning) {
        this.isRunning = false;
        onLog({
          id: uuidv4(),
          type: 'error',
          message: 'Execution timed out (5s limit)',
          timestamp: Date.now(),
        });
      }
    }, SANDBOX_TIMEOUT);
  }

  stop(): void {
    this.isRunning = false;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (this.iframe) {
      this.iframe.srcdoc = 'about:blank';
    }
  }

  reset(): void {
    this.stop();
    this.messageHandler = null;
    this.createSandbox();
  }

  destroy(): void {
    this.stop();
    if (this.iframe) {
      this.iframe.remove();
      this.iframe = null;
    }
    window.removeEventListener('message', this.handleMessage);
  }

  getIsRunning(): boolean {
    return this.isRunning;
  }
}
