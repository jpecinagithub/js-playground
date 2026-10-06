// E2E QA for JavaScript Playground against the production preview server.
// Snippets are loaded via ?code= share links (also exercises the share path).
import { chromium } from 'playwright-core';
import { deflateRawSync } from 'zlib';

const BASE = 'http://localhost:4173/';
const results = [];
function check(name, cond, extra = '') {
  results.push({ name, pass: !!cond, extra });
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + extra : ''}`);
}
function b64url(bytes) {
  return Buffer.from(bytes).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
const codeUrl = (code) => BASE + '?code=1' + b64url(deflateRawSync(Buffer.from(code, 'utf8')));

const browser = await chromium.launch({
  executablePath: '/home/hatch/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome',
});
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(String(e)));

async function runAndWaitForLog(url, waitMs = 4000) {
  await page.goto(url);
  await page.locator('.btn.run').click();
  await page.waitForTimeout(waitMs);
}

// 1. Landing
await page.goto(BASE);
check('landing title', await page.locator('.landing-lines').isVisible());
const lines = await page.locator('.landing-lines').innerText();
check('landing lines', lines.includes('Write JavaScript.') && lines.includes('Run it.'));
await page.locator('button:has-text("Start coding")').click();
await page.waitForTimeout(800);

// 2. Default run
check('editor default code', (await page.locator('.cm-content').innerText()).includes('const nombre = "JavaScript"'));
await page.locator('.btn.run').click();
await page.locator('.log-line').first().waitFor({ timeout: 8000 });
const logText = await page.locator('.log-scroll').innerText();
check('default run output', logText.includes('Hola JavaScript!'), logText.slice(0, 80));
await page.locator('.v-toggle').first().click();
await page.waitForTimeout(300);
const expanded = await page.locator('.log-scroll').innerText();
check('array expands', ['2', '4', '6', '8', '10'].every((n) => expanded.includes(n)));

// 3. Error handling
await runAndWaitForLog(codeUrl('const x = 1;\nnoExiste();'));
const errText = await page.locator('.log-scroll').innerText();
check('reference error shown', errText.includes('ReferenceError') && errText.includes('noExiste'));
check('error line number', errText.includes('Line 2'), errText.slice(0, 120));

// 4. Infinite loop timeout
await page.goto(codeUrl('while(true) {}'));
await page.locator('.btn.run').click();
await page.locator('.err-block.timeout').waitFor({ timeout: 20000 });
const toText = await page.locator('.err-block.timeout').innerText();
check('infinite loop timeout', toText.includes('Execution stopped'));
await runAndWaitForLog(codeUrl('console.log("recovered")'), 2500);
check('sandbox recovered', (await page.locator('.log-scroll').innerText()).includes('recovered'));

// 5. Promises
await runAndWaitForLog(
  codeUrl('const esperar = () => new Promise(r => setTimeout(() => r("Operación terminada"), 1000));\nesperar().then(r => console.log(r));'),
  3500,
);
check('promise resolves', (await page.locator('.log-scroll').innerText()).includes('Operación terminada'));

// 6. Examples drawer
await page.goto(BASE);
await page.locator('button:has-text("Start coding")').click();
await page.waitForTimeout(500);
await page.locator('header button:has-text("Examples")').click();
await page.waitForTimeout(400);
const cats = await page.locator('.drawer-cat h3').allInnerTexts();
check('example categories', ['fundamentals', 'modern javascript', 'asynchrony', 'other'].every((c) => cats.join(',').toLowerCase().includes(c)), cats.join(','));
await page.locator('.tpl-btn:has-text("Promises")').click();
await page.waitForTimeout(500);
check('drawer closes', !(await page.locator('.drawer').isVisible()));
const edText = await page.locator('.cm-content').innerText();
check('promises code loaded', edText.includes('esperar'));
check('explanation banner', (await page.locator('.tpl-banner').innerText()).length > 20);
check('no auto-run', (await page.locator('.log-scroll .log-line').count()) === 0);

// 7. Variables tab (promises example)
await page.locator('.btn.run').click();
await page.waitForTimeout(2500);
await page.locator('.pane-tabs button:has-text("Variables")').click();
await page.waitForTimeout(300);
const varsText = await page.locator('.log-scroll').innerText();
check('variables tab shows esperar', varsText.includes('esperar'), varsText.slice(0, 100));

// 8. Variables with const
await page.locator('header button:has-text("Examples")').click();
await page.waitForTimeout(300);
await page.locator('.tpl-btn:has-text("Variables and types")').click();
await page.waitForTimeout(400);
await page.locator('.btn.run').click();
await page.waitForTimeout(2000);
await page.locator('.pane-tabs button:has-text("Variables")').click();
await page.waitForTimeout(300);
const v2 = await page.locator('.log-scroll').innerText();
check('const vars detected', v2.includes('nombre') && v2.includes('Ana') && v2.includes('edad') && v2.includes('28') && v2.includes('activo'), v2.slice(0, 160));

// 9. REPL
await page.locator('.pane-tabs button:has-text("Console")').click();
await page.locator('.repl-input').fill('2 + 2');
await page.locator('.repl-input').press('Enter');
await page.waitForTimeout(1200);
await page.locator('.repl-input').fill('let qq = 21');
await page.locator('.repl-input').press('Enter');
await page.waitForTimeout(1200);
await page.locator('.repl-input').fill('qq * 2');
await page.locator('.repl-input').press('Enter');
await page.waitForTimeout(1200);
const replText = await page.locator('.repl-history').innerText();
check('REPL arithmetic', replText.includes('4'));
check('REPL context persists', replText.includes('42'), replText.slice(0, 200));

// 10. Step by step
await page.locator('header button:has-text("Examples")').click();
await page.waitForTimeout(300);
await page.locator('.tpl-btn:has-text("Loops")').click();
await page.waitForTimeout(400);
await page.locator('.tpl-banner button:has-text("Step by step")').click();
await page.waitForTimeout(400);
check('step modal opens', await page.locator('.modal').isVisible());
check('step counter 1/7', (await page.locator('.step-counter').innerText()).includes('Step 1 of 7'));
await page.locator('.modal-foot button:has-text("Next")').click();
await page.locator('.modal-foot button:has-text("Next")').click();
await page.waitForTimeout(300);
const counter = await page.locator('.step-counter').innerText();
check('step counter 3/7', counter.includes('Step 3 of 7'), counter);
const stepLineHl = await page.locator('.cm-step-line').count();
check('editor line highlighted', stepLineHl > 0);
await page.locator('.modal-head .icon-btn').click();

// 12. Ctrl+Enter (do before language switch)
await page.locator('.cm-content').click();
await page.keyboard.press('Control+Enter');
await page.waitForTimeout(1500);
check('ctrl+enter runs', (await page.locator('.log-scroll').innerText()).length > 0);

// 14. console.table
await runAndWaitForLog(codeUrl('console.table([{a: 1, b: 2}, {a: 3, b: 4}]);'), 2500);
const tbl = await page.locator('.v-table').count();
check('console.table renders', tbl > 0);
const tblText = await page.locator('.v-table').innerText();
check('table contents', tblText.includes('a') && tblText.includes('3'));

// 15. Dark mode
await page.locator('.settings-wrap > .icon-btn').click();
await page.waitForTimeout(300);
await page.locator('.popover button:has-text("Dark")').click();
await page.waitForTimeout(400);
check('dark theme', (await page.evaluate(() => document.documentElement.dataset.theme)) === 'dark');
await page.locator('.popover button:has-text("Light")').click();
await page.waitForTimeout(400);
check('light theme', (await page.evaluate(() => document.documentElement.dataset.theme)) === 'light');
await page.keyboard.press('Escape');

// 11. Language toggle ES
await page.locator('.lang-seg button:has-text("ES")').click();
await page.waitForTimeout(400);
check('ES run button', (await page.locator('.btn.run').innerText()).includes('Ejecutar'));
check('ES examples button', (await page.locator('header button:has-text("Ejemplos")').count()) > 0);
await page.locator('.lang-seg button:has-text("EN")').click();

// 13. Mobile
const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const mp = await mctx.newPage();
await mp.goto(BASE);
await mp.locator('button:has-text("Start coding")').click();
await mp.waitForTimeout(600);
check('mobile tabs', (await mp.locator('.mobile-tabs').isVisible()));
check('mobile single pane', !(await mp.locator('.console-pane-wrap').isVisible()));
await mp.locator('.mobile-tabs button:has-text("Result")').click();
await mp.waitForTimeout(300);
check('mobile result tab', await mp.locator('.console-pane-wrap').isVisible());
check('mobile run visible', await mp.locator('.btn.run').isVisible());
await mctx.close();

check('no page errors', pageErrors.length === 0, pageErrors.slice(0, 3).join(' | '));

// 16. fetch inside the sandbox (data: URL keeps it self-contained)
await runAndWaitForLog(
  codeUrl('async function f() {\n  const r = await fetch("data:application/json,%7B%22title%22%3A%22delectus%22%7D");\n  const d = await r.json();\n  console.log(d.title);\n}\nf();'),
  4000,
);
check('fetch in sandbox', (await page.locator('.log-scroll').innerText()).includes('delectus'));

// 17. localStorage persistence
await page.goto(codeUrl('console.log("persist-me-123");'));
await page.waitForTimeout(800);
await page.goto(BASE);
await page.locator('button:has-text("Start coding")').click();
await page.waitForTimeout(600);
check('localStorage persistence', (await page.locator('.cm-content').innerText()).includes('persist-me-123'));

// 18. PWA
const man = await page.evaluate(async () => {
  const r = await fetch('/manifest.webmanifest');
  return r.ok ? await r.json() : null;
});
check('PWA manifest', !!(man && man.name === 'JavaScript Playground' && man.icons.length >= 2));
check(
  'service worker registered',
  await page.evaluate(async () => {
    try {
      return !!(await navigator.serviceWorker.getRegistration());
    } catch {
      return false;
    }
  }),
);
check('PWA icons served', await page.evaluate(async () => (await fetch('/icons/icon-192.png')).ok));

await browser.close();
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
