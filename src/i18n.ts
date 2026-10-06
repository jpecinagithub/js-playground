export type Lang = 'en' | 'es';
export const LANGS: Lang[] = ['en', 'es'];

export interface Dict {
  landing: {
    title: string;
    lines: string[];
    cta: string;
    bullets: string[];
    footer: string;
  };
  header: { examples: string; github: string; settings: string };
  toolbar: {
    run: string;
    clear: string;
    reset: string;
    copy: string;
    share: string;
    new_: string;
    copied: string;
    shareCopied: string;
    shareTooLong: string;
    restored: string;
  };
  editor: { code: string; result: string; fontSize: string; increase: string; decrease: string };
  console_: {
    console: string;
    variables: string;
    empty: string;
    cleared: string;
    asyncCutoff: string;
    replPlaceholder: string;
    replHint: string;
    replRestarted: string;
  };
  variables: { empty: string; name: string; value: string };
  examples: {
    title: string;
    categories: Record<string, string>;
    hint: string;
    close: string;
  };
  steps: {
    button: string;
    title: string;
    step: string;
    of: string;
    result: string;
    variables: string;
    output: string;
    prev: string;
    next: string;
    close: string;
    intro: string;
  };
  errors: {
    timeoutTitle: string;
    timeoutBody: string;
    line: string;
    stopped: string;
  };
  status: { running: string; ready: string; saved: string; fromLink: string };
  shortcuts: { title: string; run: string; clear: string; save: string };
  settings: { title: string; theme: string; light: string; dark: string; system: string; fontSize: string; close: string };
  about: { createdBy: string; purpose: string; contact: string };
}

export const STR: Record<Lang, Dict> = {
  en: {
    landing: {
      title: 'JavaScript Playground',
      lines: ['Write JavaScript.', 'Run it.', 'Understand what happens.'],
      cta: 'Start coding',
      bullets: ['No install needed', 'Runs 100% in your browser', 'English / Español'],
      footer: 'Created by Jon Peciña',
    },
    header: { examples: 'Examples', github: 'GitHub', settings: 'Settings' },
    toolbar: {
      run: 'Run',
      clear: 'Clear',
      reset: 'Reset',
      copy: 'Copy',
      share: 'Share',
      new_: 'New',
      copied: 'Code copied to clipboard',
      shareCopied: 'Share link copied to clipboard',
      shareTooLong: 'This code is too long to fit in a share link',
      restored: 'Example restored',
    },
    editor: { code: 'Code', result: 'Result', fontSize: 'Font size', increase: 'Increase font size', decrease: 'Decrease font size' },
    console_: {
      console: 'Console',
      variables: 'Variables',
      empty: 'Press ▶ Run (Ctrl+Enter) to see the output here.',
      cleared: '— console cleared —',
      asyncCutoff: 'Some asynchronous operations were still pending and were stopped.',
      replPlaceholder: 'Try 2 + 2 or Math.sqrt(81)…',
      replHint: 'Independent environment — type an expression and press Enter',
      replRestarted: '— REPL restarted after a timeout —',
    },
    variables: { empty: 'No top-level variables detected in the last run.', name: 'Name', value: 'Value' },
    examples: {
      title: 'Examples',
      categories: {
        fundamentals: 'Fundamentals',
        modern: 'Modern JavaScript',
        async: 'Asynchrony',
        other: 'Other',
      },
      hint: 'Loads the code into the editor. It will not run automatically — press Run to try it.',
      close: 'Close',
    },
    steps: {
      button: 'Step by step',
      title: 'Step by step',
      step: 'Step',
      of: 'of',
      result: 'Result',
      variables: 'Variables',
      output: 'Output',
      prev: 'Previous',
      next: 'Next',
      close: 'Close',
      intro: 'Watch how the values change, line by line.',
    },
    errors: {
      timeoutTitle: 'Execution stopped',
      timeoutBody: 'The program took too long and was cancelled.',
      line: 'Line',
      stopped: 'stopped',
    },
    status: { running: 'Running…', ready: 'Ready', saved: 'Saved locally', fromLink: 'Code loaded from a shared link' },
    shortcuts: { title: 'Keyboard shortcuts', run: 'Run', clear: 'Clear console', save: 'Save locally' },
    settings: {
      title: 'Settings',
      theme: 'Theme',
      light: 'Light',
      dark: 'Dark',
      system: 'System',
      fontSize: 'Editor font size',
      close: 'Close',
    },
    about: {
      createdBy: 'Created by Jon Peciña',
      purpose:
        'A hands-on lab for learning JavaScript through direct experimentation: tweak the code, run it, and immediately see what happens.',
      contact: 'Contact',
    },
  },
  es: {
    landing: {
      title: 'JavaScript Playground',
      lines: ['Escribe JavaScript.', 'Ejecútalo.', 'Comprende qué ocurre.'],
      cta: 'Empezar a programar',
      bullets: ['Sin instalación', 'Funciona 100% en tu navegador', 'English / Español'],
      footer: 'Creado por Jon Peciña',
    },
    header: { examples: 'Ejemplos', github: 'GitHub', settings: 'Ajustes' },
    toolbar: {
      run: 'Ejecutar',
      clear: 'Limpiar',
      reset: 'Reiniciar',
      copy: 'Copiar',
      share: 'Compartir',
      new_: 'Nuevo',
      copied: 'Código copiado al portapapeles',
      shareCopied: 'Enlace copiado al portapapeles',
      shareTooLong: 'Este código es demasiado largo para un enlace',
      restored: 'Ejemplo restaurado',
    },
    editor: { code: 'Código', result: 'Resultado', fontSize: 'Tamaño de fuente', increase: 'Aumentar fuente', decrease: 'Reducir fuente' },
    console_: {
      console: 'Consola',
      variables: 'Variables',
      empty: 'Pulsa ▶ Ejecutar (Ctrl+Enter) para ver el resultado aquí.',
      cleared: '— consola limpia —',
      asyncCutoff: 'Algunas operaciones asíncronas seguían pendientes y se detuvieron.',
      replPlaceholder: 'Prueba 2 + 2 o Math.sqrt(81)…',
      replHint: 'Entorno independiente — escribe una expresión y pulsa Enter',
      replRestarted: '— REPL reiniciado tras un timeout —',
    },
    variables: { empty: 'No se detectaron variables de nivel superior en la última ejecución.', name: 'Nombre', value: 'Valor' },
    examples: {
      title: 'Ejemplos',
      categories: {
        fundamentals: 'Fundamentos',
        modern: 'JavaScript moderno',
        async: 'Asincronía',
        other: 'Otros',
      },
      hint: 'Carga el código en el editor. No se ejecutará solo — pulsa Ejecutar para probarlo.',
      close: 'Cerrar',
    },
    steps: {
      button: 'Ver paso a paso',
      title: 'Ver paso a paso',
      step: 'Paso',
      of: 'de',
      result: 'Resultado',
      variables: 'Variables',
      output: 'Salida',
      prev: 'Anterior',
      next: 'Siguiente',
      close: 'Cerrar',
      intro: 'Observa cómo cambian los valores, línea a línea.',
    },
    errors: {
      timeoutTitle: 'Ejecución detenida',
      timeoutBody: 'El programa ha tardado demasiado tiempo y ha sido cancelado.',
      line: 'Línea',
      stopped: 'detenida',
    },
    status: { running: 'Ejecutando…', ready: 'Listo', saved: 'Guardado localmente', fromLink: 'Código cargado desde un enlace compartido' },
    shortcuts: { title: 'Atajos de teclado', run: 'Ejecutar', clear: 'Limpiar consola', save: 'Guardar localmente' },
    settings: {
      title: 'Ajustes',
      theme: 'Tema',
      light: 'Claro',
      dark: 'Oscuro',
      system: 'Sistema',
      fontSize: 'Tamaño de fuente del editor',
      close: 'Cerrar',
    },
    about: {
      createdBy: 'Creado por Jon Peciña',
      purpose:
        'Un laboratorio práctico para aprender JavaScript experimentando directamente: modifica el código, ejecútalo y observa inmediatamente qué ocurre.',
      contact: 'Contacto',
    },
  },
};
