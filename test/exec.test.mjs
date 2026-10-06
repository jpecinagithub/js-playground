// Unit tests for the sandbox core (serializer + runUserCode), executed in Node.
// The worker messaging layer is thin; the logic under test is identical.
import { runUserCode, topLevelNames } from './dist-test/sandbox.bundle.cjs';

let failures = 0;
function ok(cond, name) {
  if (cond) console.log(`  ok  ${name}`);
  else {
    failures++;
    console.error(`  FAIL ${name}`);
  }
}
function eq(a, b, name) {
  ok(JSON.stringify(a) === JSON.stringify(b), `${name} (got ${JSON.stringify(a)})`);
}

async function run(code, budgetMs = 1500) {
  const logs = [];
  const outcome = await runUserCode(code, { onLog: (m) => logs.push(m) }, { budgetMs });
  return { logs, ...outcome };
}

// 1. sync values
{
  const { logs } = await run(`const a = 1; console.log(a, "x", [1,2], {b: true}, null, undefined, 10n);`);
  ok(logs.length === 1, 'sync: one log entry');
  const args = logs[0].args;
  eq(args[0], { k: 'num', v: 1 }, 'sync: number');
  eq(args[1], { k: 'str', v: 'x' }, 'sync: string');
  ok(args[2].k === 'arr' && args[2].len === 2, 'sync: array');
  ok(args[3].k === 'obj' && args[3].entries[0][0] === 'b', 'sync: object');
  eq(args[4], { k: 'null' }, 'sync: null');
  eq(args[5], { k: 'undef' }, 'sync: undefined');
  eq(args[6], { k: 'big', v: '10' }, 'sync: bigint');
}

// 2. error with line number
{
  const { logs } = await run(`const x = 1;\nnope();`);
  ok(logs.length === 1 && logs[0].method === 'error', 'error: captured as error');
  const e = logs[0].args[0];
  ok(e.k === 'err' && e.name === 'ReferenceError' && e.line === 2, `error: name+line (got ${e.name}:${e.line})`);
}

// 3. promise + async/await + setTimeout
{
  const { logs, asyncCutoff } = await run(`
    Promise.resolve(42).then(v => console.log('p', v));
    async function f() { await new Promise(r => setTimeout(r, 120)); console.log('t'); }
    f();
  `);
  ok(!asyncCutoff, 'async: no cutoff');
  const flat = logs.map((l) => l.args.map((a) => (a.k === 'str' ? a.v : a.v)).join(' ')).join('|');
  ok(flat.includes('p 42') && flat.includes('t'), `async: promise and timer fired (${flat})`);
}

// 4. async cutoff with a never-ending interval
{
  const { asyncCutoff, logs } = await run(`setInterval(() => console.log('tick'), 60);`, 400);
  ok(asyncCutoff === true, 'cutoff: flagged');
  ok(logs.length >= 2, `cutoff: partial logs kept (${logs.length})`);
}

// 5. variables inspector — instrumentation records const/let/var/function/class
{
  const { vars } = await run(`const nombre = "Ana";\nlet edad = 28;\nconst {a, b: c} = {a: 1, b: 2};\nconst [x] = [9];\nvar v = true;\nfunction suma(a, b) { return a + b; }\nclass P {}\nlet later = nombre + "!";`);
  const map = Object.fromEntries(vars);
  ok(map.nombre && map.nombre.k === 'str' && map.nombre.v === 'Ana', 'vars: const string');
  ok(map.edad && map.edad.k === 'num' && map.edad.v === 28, 'vars: let number');
  ok(map.a && map.a.v === 1 && map.c && map.c.v === 2, 'vars: destructured object');
  ok(map.x && map.x.v === 9, 'vars: destructured array');
  ok(map.v && map.v.v === true, 'vars: var boolean');
  ok(map.suma && map.suma.k === 'fn', 'vars: function declaration');
  ok(map.P && map.P.k === 'fn', 'vars: class');
  ok(map.later && map.later.v === 'Ana!', 'vars: declaration order respected');
}
{
  // error line numbers are unaffected by instrumentation (no newlines added)
  const { logs } = await run(`const x = 1;\nnope();`);
  const e = logs[0].args[0];
  ok(e.k === 'err' && e.line === 2, `instrumentation: error line preserved (got ${e.line})`);
}
{
  const names = topLevelNames(`const nombre = "Ana";\nlet edad = 28;\nconst {a, b: c} = {a: 1, b: 2};\nconst [x] = [9];\nvar v = true;`);
  eq(names, ['nombre', 'edad', 'a', 'c', 'x', 'v'], 'vars: declaration names detected');
}

// 6. circular refs don't blow up
{
  const { logs } = await run(`const o = {}; o.self = o; console.log(o);`);
  const inner = logs[0].args[0];
  ok(inner.k === 'obj' && inner.entries[0][1].k === 'circ', 'circular: marked');
}

// 7. console.table
{
  const { logs } = await run(`console.table([{a: 1, b: 2}, {a: 3, b: 4}]);`);
  const t = logs[0].args[0];
  ok(t.k === 'tbl' && t.cols.join(',') === 'a,b' && t.rows.length === 2, 'table: tabular');
}

// 8. console methods routing
{
  const { logs } = await run(`console.info('i'); console.warn('w'); console.error('e');`);
  eq(logs.map((l) => l.method), ['info', 'warn', 'error'], 'methods: routed');
}

// 9. topLevelNames edge cases (strings/templates/regex must not confuse it)
{
  const names = topLevelNames([
    'const real = 1;',
    'const s = "const fake = 2;";',
    'const t = `const nope = ${real}`;',
    'const re = /const x/;',
    '// const comment = 1;',
    'function f() { const inner = 1; }',
    'for (let i = 0; i < 1; i++) {}',
  ].join('\n'));
  eq(names, ['real', 's', 't', 're', 'f'], 'scan: ignores strings/templates/regex/comments/inner scopes');
}

// 10. fetch is available in the sandbox (network may fail; must not crash the worker logic)
{
  const { logs } = await run(`console.log(typeof fetch);`);
  eq(logs[0].args[0], { k: 'str', v: 'function' }, 'fetch: present');
}

console.log(failures === 0 ? '\nALL TESTS PASSED' : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
