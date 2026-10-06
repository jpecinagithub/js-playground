# JavaScript Playground

An interactive, visual, no-backend lab for writing, running and experimenting with JavaScript directly in the browser. Tweak the code → run it → immediately see what happens.

**Live:** deploy the repo on Vercel (no configuration needed).

## Features

- **Editor** (CodeMirror): syntax highlighting, line numbers, auto-indent, font-size controls, copy / clear / restore
- **Console**: captures `console.log/info/warn/error/table`, expandable arrays & objects, clean error messages with line numbers
- **Safe execution**: user code runs in a fresh Web Worker per run, isolated from the app; infinite loops are terminated by a watchdog with a friendly timeout message
- **Async support**: promises, `async/await`, `setTimeout`/`setInterval` and `fetch` all work; pending async is awaited up to a budget
- **15 built-in examples** (EN/ES explanations): variables, conditionals, functions, arrows, arrays, map/filter/reduce, objects, destructuring, spread, loops, callbacks, promises, async/await, fetch, classes
- **Step-by-step mode**: watch values change line by line on the basic examples
- **Variables inspector**: top-level declared variables after each run
- **Interactive REPL**: persistent `>` console with history (independent environment)
- **Bilingual** EN/ES (EN default), **light/dark/system** themes, fully responsive (tabs on mobile), draggable splitter on desktop
- **PWA**: installable, offline-capable (bundled examples work offline)
- **Share links**: `?code=` encodes a snippet (deflate + base64url, no backend)
- **Persistence**: code, template, theme, font size and language in `localStorage`
- **Vercel Analytics**: general events only (`playground_open`, `run_code`, `template_selected`, `language_changed`) — user code is never collected

## Stack

Vite + React + TypeScript, CodeMirror 6, `vite-plugin-pwa`, `@vercel/analytics`. Zero backend, zero database, zero sign-up.

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build   # type-check + production build into dist/
npm run preview # serve the production build locally
```

Unit tests for the sandbox core (serializer, console capture, async tracking, declaration scanning):

```bash
node test/exec.test.mjs
```

End-to-end QA in headless Chromium (40 checks: landing, runs, errors, infinite-loop
timeout, promises, examples, variables, REPL, step-by-step, ES/EN, keyboard,
mobile, console.table, themes, fetch, persistence, PWA):

```bash
node test/e2e.mjs   # requires: npm run build && npx vite preview --port 4173
```

---

Created by Jon Peciña — a hands-on lab for learning JavaScript through direct experimentation.
