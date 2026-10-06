import { track } from '@vercel/analytics';

// General events only — the user's code is never collected.
function safe(fn: () => void) {
  try {
    fn();
  } catch {
    /* analytics must never break the app */
  }
}

export const analytics = {
  open: () => safe(() => track('playground_open')),
  run: () => safe(() => track('run_code')),
  template: (name: string) => safe(() => track('template_selected', { name })),
  language: (lang: string) => safe(() => track('language_changed', { lang })),
};
