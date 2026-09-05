/**
 * `addThemeColor` in `utils/plugin-tools/theme-tools` is deck-wide, not
 * per-plugin: it measures the theme and keeps `--c-theme-color` on the viewport
 * for anything that wants to follow the deck. More than one plugin wants that,
 * so the measuring is guarded to happen once per deck, and every later caller
 * gets the same answer back.
 *
 * Measuring only works in a browser, so the test drives real headless Chrome
 * over the DevTools protocol against the built `dist/plugintoolkit.mjs`. Run
 * `npm run build` first; `npm test` does both.
 *
 *   node test/theme-tools.test.mjs
 *
 * The fixture loads a theme, because a deck without one has no second colour to
 * find, and two copies of the toolkit under their own URLs, which is how plugins
 * ship: each bundles the toolkit rather than sharing one instance.
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
const PORT = 4520;
const CDP_PORT = 9520;

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
<html><head><meta charset="utf-8"><title>theme-tools fixture</title>
  <link rel="stylesheet" href="./reveal.css">
  <link rel="stylesheet" href="./theme.css">
</head>
<body>
  <div class="reveal"><div class="slides">
    <section><h2>Ordinary</h2></section>
    <section data-background-color="#ffffff"><h2>Light background</h2></section>
    <section><h2>Ordinary again</h2></section>
  </div></div>
  <script type="importmap">{"imports":{"deepmerge":"./deepmerge.mjs"}}</script>
  <script type="module">
    import Reveal from './reveal.mjs';
    import { themeTools } from './plugintoolkit.mjs';
    import { themeTools as themeToolsB } from './plugintoolkit-copy.mjs';
    const deck = new Reveal({ hash: false });
    window.tk = themeTools;
    window.tkB = themeToolsB;
    deck.initialize().then(() => { window.deck = deck; });
  </script>
</body></html>`;

async function buildFixture() {
	const dir = await mkdtemp(join(tmpdir(), 'plugintoolkit-theme-test-'));
	await writeFile(join(dir, 'index.html'), PAGE);
	await copyFile(join(ROOT, 'dist/plugintoolkit.mjs'), join(dir, 'plugintoolkit.mjs'));
	// A second copy under its own URL, instantiated separately — which is how plugins ship, each bundling the toolkit rather than sharing one.
	await copyFile(join(ROOT, 'dist/plugintoolkit.mjs'), join(dir, 'plugintoolkit-copy.mjs'));
	await copyFile(join(ROOT, 'node_modules/reveal.js/dist/reveal.mjs'), join(dir, 'reveal.mjs'));
	await copyFile(join(ROOT, 'node_modules/reveal.js/dist/reveal.css'), join(dir, 'reveal.css'));
	// moon, because it is dark (so the inverted colour differs) and it colours headings differently from body text (#eee8d5 against #93a1a1), which black does not. A theme that paints both the same would let a one-reading-for-both bug pass.
	await copyFile(join(ROOT, 'node_modules/reveal.js/dist/theme/moon.css'), join(dir, 'theme.css'));
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
		'--no-default-browser-check', `--user-data-dir=${join(tmpdir(), 'plugintoolkit-theme-cdp')}`, 'about:blank'
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
  const R = window.deck, tk = window.tk, tkB = window.tkB;
  const vp = R.getViewportElement();
  const results = [];
  const check = (name, expected, actual) =>
    results.push({ name, expected, actual, pass: JSON.stringify(expected) === JSON.stringify(actual) });

  const sectionsBefore = document.querySelectorAll('.slides > section').length;
  const at = async (h) => { R.slide(h, 0); await wait(400); };
  const colorVar = () => vp.style.getPropertyValue('--c-theme-color').trim();
  const headingVar = () => vp.style.getPropertyValue('--c-theme-heading-color').trim();
  const inverted = () => vp.classList.contains('c-theme-inverted');

  // ---- two plugins, one measurement ---------------------------------------
  // Both calls go out before either resolves, which is how two plugins starting together behave.
  const [a, b] = await Promise.all([tk.addThemeColor(R), tkB.addThemeColor(R)]);

  check('two copies get the same colours', true, a === b);
  check('the theme was read', true, !!a && a.text.regular !== a.text.inverse);
  check('a dark theme is reported as dark', 'dark', a && a.theme);

  // moon colours headings separately, which is why one reading cannot answer for both.
  check('headings are read apart from body text', true, !!a && a.heading.regular !== a.text.regular);
  check('the inverted colours are found too', true, !!a && a.heading.inverse !== a.heading.regular);

  // A later call, after the first has settled, is the other order two plugins can arrive in.
  const c = await tkB.addThemeColor(R);
  check('a later call gets the same colours again', true, a === c);

  // ---- the measuring leaves nothing behind ---------------------------------
  check('no test section is left in the deck', sectionsBefore,
        document.querySelectorAll('.slides > section').length);

  // ---- what it publishes ---------------------------------------------------
  await at(0);
  check('ordinary slide: not marked inverted', false, inverted());
  check('ordinary slide: the regular text colour', a.text.regular, colorVar());
  check('ordinary slide: the regular heading colour', a.heading.regular, headingVar());

  await at(1);
  check('inverted slide: marked inverted', true, inverted());
  check('inverted slide: the other text colour', a.text.inverse, colorVar());
  check('inverted slide: the other heading colour', a.heading.inverse, headingVar());

  await at(2);
  check('back to ordinary: the regular text colour', a.text.regular, colorVar());
  check('back to ordinary: no longer marked', false, inverted());

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
