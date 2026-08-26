/**
 * Both event dispatchers in `utils/plugin-tools/event-tools` are deck-wide, not
 * per-plugin: whoever installs one serves every listener on the deck. More than
 * one plugin wants them, so each is guarded to install once per deck.
 *
 * These events only exist in a browser, so the test drives real headless Chrome
 * over the DevTools protocol against the built `dist/plugintoolkit.mjs`. Run
 * `npm run build` first; `npm test` does both.
 *
 *   node test/event-tools.test.mjs
 *
 * No test framework and no new dependencies: reveal.js and deepmerge already sit
 * in node_modules, and the fixture is written to a temp directory at run time so
 * nothing needs to be committed alongside it.
 */
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdtemp, writeFile, copyFile, readFile, rm } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, extname, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 4519;
const CDP_PORT = 9519;

const CHROME_CANDIDATES = [
	process.env.CHROME_PATH,
	'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
	'/Applications/Chromium.app/Contents/MacOS/Chromium',
	'/usr/bin/google-chrome',
	'/usr/bin/chromium'
].filter(Boolean);

const MIME = { '.html': 'text/html', '.mjs': 'text/javascript', '.js': 'text/javascript', '.css': 'text/css' };

/* -------------------------------------------------------------------------- */
/* fixture                                                                     */
/* -------------------------------------------------------------------------- */

const PAGE = `<!doctype html>
<html><head><meta charset="utf-8"><title>event-tools fixture</title></head>
<body>
  <div class="reveal"><div class="slides">
    <section><h2>A</h2></section>
    <section><section><h2>B1</h2></section><section><h2>B2</h2></section><section><h2>B3</h2></section></section>
    <section><h2>C</h2></section>
  </div></div>
  <script type="importmap">{"imports":{"deepmerge":"./deepmerge.mjs"}}</script>
  <script type="module">
    import Reveal from './reveal.mjs';
    import { eventTools } from './plugintoolkit.mjs';
    import { eventTools as eventToolsB } from './plugintoolkit-copy.mjs';
    const deck = new Reveal({ hash: false });
    window.tk = eventTools;
    window.tkB = eventToolsB;
    deck.initialize().then(() => { window.deck = deck; });
  </script>
</body></html>`;

async function buildFixture() {
	const dir = await mkdtemp(join(tmpdir(), 'plugintoolkit-test-'));
	await writeFile(join(dir, 'index.html'), PAGE);
	await copyFile(join(ROOT, 'dist/plugintoolkit.mjs'), join(dir, 'plugintoolkit.mjs'));
	// A second copy under its own URL, instantiated separately — which is how plugins ship, each bundling the toolkit rather than sharing one.
	await copyFile(join(ROOT, 'dist/plugintoolkit.mjs'), join(dir, 'plugintoolkit-copy.mjs'));
	await copyFile(join(ROOT, 'node_modules/reveal.js/dist/reveal.mjs'), join(dir, 'reveal.mjs'));
	// deepmerge publishes UMD/CJS only, and the page loads as a module.
	const umd = await readFile(join(ROOT, 'node_modules/deepmerge/dist/umd.js'), 'utf8');
	await writeFile(join(dir, 'deepmerge.mjs'), `${umd}\nexport default deepmerge;\n`);
	return dir;
}

/* -------------------------------------------------------------------------- */
/* harness                                                                     */
/* -------------------------------------------------------------------------- */

function serve(dir) {
	const server = createServer((req, res) => {
		const path = join(dir, decodeURIComponent(req.url.split('?')[0]) === '/' ? 'index.html' : decodeURIComponent(req.url.split('?')[0]));
		res.setHeader('Content-Type', MIME[extname(path)] ?? 'application/octet-stream');
		createReadStream(path).on('error', () => { res.statusCode = 404; res.end(); }).pipe(res);
	});
	return new Promise((ok) => server.listen(PORT, '127.0.0.1', () => ok(server)));
}

async function evaluate(url, expression) {
	const chrome = CHROME_CANDIDATES.find(Boolean);
	const proc = spawn(chrome, [
		'--headless=new', `--remote-debugging-port=${CDP_PORT}`, '--no-first-run',
		'--no-default-browser-check', `--user-data-dir=${join(tmpdir(), 'plugintoolkit-cdp')}`, 'about:blank'
	], { stdio: 'ignore' });

	let target;
	for (let i = 0; i < 80; i++) {
		try {
			const r = await fetch(`http://127.0.0.1:${CDP_PORT}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' });
			target = await r.json();
			break;
		} catch { await sleep(150); }
	}
	if (!target) { proc.kill(); throw new Error('Chrome did not start. Set CHROME_PATH if it is installed elsewhere.'); }

	const ws = new WebSocket(target.webSocketDebuggerUrl);
	await new Promise((ok, no) => { ws.onopen = ok; ws.onerror = no; });

	let id = 0;
	const pending = new Map();
	const errors = [];
	ws.onmessage = (m) => {
		const msg = JSON.parse(m.data);
		if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
		if (msg.method === 'Runtime.exceptionThrown') {
			errors.push(msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text);
		}
	};
	const send = (method, params = {}) =>
		new Promise((ok) => { const i = ++id; pending.set(i, ok); ws.send(JSON.stringify({ id: i, method, params })); });

	await send('Runtime.enable');
	// Wait for the deck rather than guessing a delay.
	for (let i = 0; i < 60; i++) {
		const r = await send('Runtime.evaluate', { expression: '!!window.deck', returnByValue: true });
		if (r.result?.result?.value) break;
		await sleep(100);
	}

	const out = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
	ws.close();
	proc.kill();

	if (out.result?.exceptionDetails) {
		throw new Error(`page threw: ${out.result.exceptionDetails.exception?.description ?? out.result.exceptionDetails.text}`);
	}
	return { value: out.result?.result?.value, errors };
}

/* -------------------------------------------------------------------------- */
/* the assertions, run inside the page                                         */
/* -------------------------------------------------------------------------- */

const SUITE = `(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const R = window.deck, tk = window.tk, tkB = window.tkB, vp = R.getViewportElement();
  const results = [];
  const check = (name, expected, actual) =>
    results.push({ name, expected, actual, pass: JSON.stringify(expected) === JSON.stringify(actual) });

  let h = 0, v = 0, enter = 0, exit = 0;
  R.on('slidechanged-h', () => h++);
  R.on('slidechanged-v', () => v++);
  R.on('scrollmode-enter', () => enter++);
  R.on('scrollmode-exit',  () => exit++);
  const reset = () => { h = 0; v = 0; enter = 0; exit = 0; };

  // Every measurement starts from slide 0, so no block is thrown off by where the last one ended. Counters clear after the jump, which is itself a slide change.
  const from00 = async () => { R.slide(0, 0); await wait(350); reset(); };

  // Adding and removing the class is what the scroll view does, and what the observer watches.
  const scrollOn  = async () => { vp.classList.add('reveal-scroll');    await wait(120); };
  const scrollOff = async () => { vp.classList.remove('reveal-scroll'); await wait(120); };

  // Checked rather than assumed, so a build that lost the teardown says so instead of throwing and discarding every later result.
  const off = (fn, label) => {
    if (typeof fn === 'function') return fn();
    results.push({ name: 'teardown returned by ' + label, expected: 'function',
                   actual: typeof fn, pass: false });
  };

  // ---- independence, before direction is installed -------------------------
  // Direction cannot be uninstalled, so this check has to come first.
  const scrSolo = tk.addScrollModeEvents(R);
  await from00();
  R.right(); await wait(300);
  check('independence: a scrollmode install does not arm direction', { h: 0 }, { h });
  off(scrSolo, 'addScrollModeEvents');

  // ---- direction events ----------------------------------------------------
  // No teardown by design, so the contract is just that repeat calls do not stack up — here from two separate copies, as Simplemenu and Verticator arrive.
  tk.addDirectionEvents(R);        // "plugin A", its own bundled copy
  tkB.addMoreDirectionEvents(R);   // "plugin B", a different copy, old alias

  // slide 0 → right lands on the vertical stack, so both downs have somewhere to go
  await from00();
  R.right(); await wait(300);
  R.down();  await wait(300);
  R.down();  await wait(300);
  check('direction: two installs dispatch once each', { h: 1, v: 2 }, { h, v });

  check('direction: install returns nothing to call', 'undefined', typeof tk.addDirectionEvents(R));

  await from00();
  tkB.addDirectionEvents(R);
  R.right(); await wait(300);
  check('direction: a third install from either copy still dispatches once', { h: 1 }, { h });

  // Reveal.destroy() leaves wrapper listeners in place, so re-initialising must not end up with two.
  R.destroy(); await wait(200);
  await R.initialize(); await wait(400);
  await from00();
  tk.addDirectionEvents(R);
  R.right(); await wait(400);
  check('direction: survives destroy + initialize without doubling', { h: 1 }, { h });

  // ---- independence, the other way -----------------------------------------
  // Direction is installed now, scroll mode is not.
  reset();
  await scrollOn(); await scrollOff();
  check('independence: a direction install does not arm scrollmode', { enter: 0, exit: 0 }, { enter, exit });

  // ---- scroll mode events --------------------------------------------------
  const scrA = tk.addScrollModeEvents(R);
  const scrB = tkB.addScrollModeEvents(R);   // the other copy

  reset();
  await scrollOn(); await scrollOff();
  check('scrollmode: two installs dispatch once each', { enter: 1, exit: 1 }, { enter, exit });

  reset(); off(scrB, 'addScrollModeEvents');
  await scrollOn(); await scrollOff();
  check("scrollmode: B's teardown leaves A's events alone", { enter: 1, exit: 1 }, { enter, exit });

  reset(); off(scrA, 'addScrollModeEvents');
  await scrollOn(); await scrollOff();
  check("scrollmode: installer's teardown stops them", { enter: 0, exit: 0 }, { enter, exit });

  reset();
  const scrC = tkB.addScrollModeEvents(R);
  await scrollOn(); await scrollOff();
  check('scrollmode: re-installable after teardown, from either copy', { enter: 1, exit: 1 }, { enter, exit });
  off(scrC, 'addScrollModeEvents');

  return JSON.stringify(results);
})().catch(e => JSON.stringify([{ name: 'suite threw: ' + (e && e.message || e),
                                  expected: 'no exception', actual: 'exception', pass: false }]))`;

/* -------------------------------------------------------------------------- */

let dir, server;
try {
	dir = await buildFixture();
	server = await serve(dir);
	const { value, errors } = await evaluate(`http://127.0.0.1:${PORT}/`, SUITE);
	const results = JSON.parse(value);

	for (const r of results) {
		console.log(`${r.pass ? 'ok  ' : 'FAIL'}  ${r.name}`);
		if (!r.pass) console.log(`        expected ${JSON.stringify(r.expected)}, got ${JSON.stringify(r.actual)}`);
	}
	for (const e of errors) console.log(`page error: ${e}`);

	const failed = results.filter((r) => !r.pass).length;
	console.log(`\n${results.length - failed} passed, ${failed} failed`);
	process.exitCode = failed || errors.length ? 1 : 0;
} finally {
	server?.close();
	if (dir) await rm(dir, { recursive: true, force: true });
}
