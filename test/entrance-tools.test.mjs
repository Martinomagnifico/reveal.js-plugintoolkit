/**
 * `entranceTools` lets a container that animates in say how far it is, and lets whatever is inside it wait for that. What has to hold:
 *
 *  - an announced element is `shown` at its moment and `in` at the end, in that order, with an event for each that bubbles;
 *  - `data-entrance-at` moves the `shown` moment;
 *  - `whenShown` resolves at once when nothing around the element is pending, waits for every pending container up to the slide, and resolves `false` when aborted;
 *  - a late listener reads the state instead of waiting for an event it missed;
 *  - `reset` calls off a running announcement, also from another copy of the toolkit;
 *  - with reduced motion nothing is waited for.
 *
 * One copy of the toolkit announces and another waits, which is how plugins use it: each bundles its own. The test drives real headless Chrome over the DevTools protocol against the built `dist/plugintoolkit.mjs`. Run `npm run build` first; `npm test` does both.
 *
 *   node test/entrance-tools.test.mjs
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
const PORT = 4527;
const CDP_PORT = 9527;

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

const SLIDES = `
  <section data-label="one">
    <div id="outer"><div id="inner"><p id="leaf">Leaf</p></div></div>
    <div id="still"><p id="free">Free</p></div>
  </section>`;

const PAGE = `<!doctype html>
<html><head><meta charset="utf-8"><title>entrance-tools fixture</title>
<link rel="stylesheet" href="./reveal.css">
<style>body { margin: 0; }</style>
</head>
<body>
  <script type="importmap">{"imports":{"deepmerge":"./deepmerge.mjs"}}</script>
  <script type="module">
    import Reveal from './reveal.mjs';
    import { entranceTools } from './plugintoolkit.mjs';
    import { entranceTools as entranceToolsB } from './plugintoolkit-copy.mjs';
    // A, the plugin that animates; B, the plugin that waits.
    window.A = entranceTools;
    window.B = entranceToolsB;

    const el = document.createElement('div');
    el.className = 'reveal';
    el.innerHTML = '<div class="slides">' + ${JSON.stringify(SLIDES)} + '</div>';
    document.body.appendChild(el);
    const deck = new Reveal(el, { hash: false, transition: 'none', backgroundTransition: 'none', controlsTutorial: false });
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
	await copyFile(join(ROOT, 'node_modules/reveal.js/dist/reveal.css'), join(dir, 'reveal.css'));
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
		'--no-default-browser-check', '--window-size=1200,800',
		`--user-data-dir=${join(tmpdir(), 'plugintoolkit-cdp-entrance')}`, 'about:blank'
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
	for (let i = 0; i < 80; i++) {
		const r = await send('Runtime.evaluate', { expression: '!!window.deck', returnByValue: true });
		if (r.result?.result?.value) break;
		await sleep(100);
	}

	const out = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
	ws.close();
	proc.kill();
	await sleep(600);

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
  const results = [];
  const check = (name, expected, actual) =>
    results.push({ name, expected, actual, pass: JSON.stringify(expected) === JSON.stringify(actual) });
  const $ = id => document.getElementById(id);
  const clean = () => { for (const e of document.querySelectorAll('[data-entrance]')) { B.reset(e); e.removeAttribute('data-entrance'); e.removeAttribute('data-entrance-at'); } };
  // When a promise settles, in ms from now, and with what.
  const timed = p => { const t0 = performance.now(); return p.then(v => ({ v, t: Math.round(performance.now() - t0) })); };
  const within = (t, lo, hi) => t >= lo && t <= hi;

  // 1. Nothing animates around the element.
  {
    const r = await timed(B.whenShown($('leaf')));
    check('nothing pending: resolves true at once', [true, true], [r.v, r.t < 20]);
    check('nothing pending: pendingAround is empty', 0, B.pendingAround($('leaf')).length);
  }

  // 2. One container, announced by A, waited for by B.
  {
    clean();
    A.markPending($('outer'));
    check('markPending writes the state', 'pending', $('outer').getAttribute('data-entrance'));
    check('pendingAround finds it', ['outer'], B.pendingAround($('leaf')).map(e => e.id));
    const events = [];
    const log = e => events.push([e.type, e.detail.state, e.detail.element.id]);
    document.addEventListener('entranceshown', log);
    document.addEventListener('entrancein', log);
    const shown = timed(B.whenShown($('leaf'), 'shown'));
    const into = timed(B.whenShown($('leaf'), 'in'));
    await wait(50);
    A.announce($('outer'), { duration: 300 });
    const s = await shown, i = await into;
    check('shown resolves true, half way (about 200 ms)', [true, true], [s.v, within(s.t, 180, 260)]);
    check('in resolves true, at the end (about 350 ms)', [true, true], [i.v, within(i.t, 330, 420)]);
    check('the events bubble, in order, with their detail', [['entranceshown', 'shown', 'outer'], ['entrancein', 'in', 'outer']], events);
    check('the state ends as in', 'in', $('outer').getAttribute('data-entrance'));
    document.removeEventListener('entranceshown', log);
    document.removeEventListener('entrancein', log);
  }

  // 3. A late listener: the container is already in.
  {
    const r = await timed(B.whenShown($('leaf'), 'in'));
    check('already in: resolves at once', [true, true], [r.v, r.t < 20]);
  }

  // 4. data-entrance-at.
  {
    clean();
    $('outer').dataset.entranceAt = '0.2';
    A.announce($('outer'), { duration: 500 });
    const shown = timed(B.whenShown($('leaf')));
    const s = await shown;
    check('data-entrance-at 0.2 of 500 ms: shown after about 100 ms', true, within(s.t, 85, 160));
  }

  // 5. Containers inside containers: the leaf waits for both.
  {
    clean();
    A.markPending($('outer'));
    A.markPending($('inner'));
    check('pendingAround lists both, nearest first', ['inner', 'outer'], B.pendingAround($('leaf')).map(e => e.id));
    const shown = timed(B.whenShown($('leaf')));
    A.announce($('outer'), { duration: 100 });
    A.announce($('inner'), { duration: 200, delay: 200 });
    const s = await shown;
    check('nested: waits for the later one, inner at about 300 ms', true, within(s.t, 280, 360));
  }

  // 6. The element itself counts, and the search stops at the slide.
  {
    clean();
    A.markPending($('leaf'));
    check('the element itself counts', ['leaf'], B.pendingAround($('leaf')).map(e => e.id));
    clean();
    const section = document.querySelector('section');
    section.setAttribute('data-entrance', 'pending');
    check('the slide itself is not looked at', 0, B.pendingAround($('leaf')).length);
    section.removeAttribute('data-entrance');
  }

  // 7. Aborted.
  {
    clean();
    A.markPending($('outer'));
    const c = new AbortController();
    const r = timed(B.whenShown($('leaf'), 'shown', c.signal));
    await wait(30);
    c.abort();
    const a = await r;
    check('aborted: resolves false', false, a.v);
    const pre = new AbortController(); pre.abort();
    check('aborted before: resolves false', false, await B.whenShown($('leaf'), 'shown', pre.signal));
  }

  // 8. Reset by the other copy calls the announcement off.
  {
    clean();
    const events = [];
    const log = e => events.push(e.type);
    $('outer').addEventListener('entranceshown', log);
    A.announce($('outer'), { duration: 200 });
    await wait(40);
    B.reset($('outer'));
    await wait(260);
    check('reset from another copy: no events after it', [], events);
    check('reset: pending again', 'pending', $('outer').getAttribute('data-entrance'));
    $('outer').removeEventListener('entranceshown', log);
  }

  // 9. No duration: shown and in at once, in that order.
  {
    clean();
    const events = [];
    const log = e => events.push(e.type);
    $('outer').addEventListener('entranceshown', log);
    $('outer').addEventListener('entrancein', log);
    A.announce($('outer'), { duration: 0 });
    await wait(30);
    check('duration 0: shown, then in', ['entranceshown', 'entrancein'], events);
  }

  // 10. Reduced motion.
  {
    clean();
    A.markPending($('outer'));
    const real = window.matchMedia;
    window.matchMedia = q => ({ matches: q.includes('reduce') });
    const r = await timed(B.whenShown($('leaf')));
    window.matchMedia = real;
    check('reduced motion: resolves at once while pending', [true, true], [r.v, r.t < 20]);
  }

  clean();
  return JSON.stringify(results);
})()`;

const CASES = [{ title: 'entranceTools, announced by one copy and waited for by another', query: '', suite: SUITE }];

/* -------------------------------------------------------------------------- */

let dir, server;
let passed = 0;
let failed = 0;
let pageErrors = 0;
try {
	dir = await buildFixture();
	server = await serve(dir);

	for (const c of CASES) {
		console.log(`\n${c.title}`);
		const { value, errors } = await evaluate(`http://127.0.0.1:${PORT}/?${c.query}`, c.suite);
		const results = JSON.parse(value);
		for (const r of results) {
			console.log(`${r.pass ? 'ok  ' : 'FAIL'}  ${r.name}`);
			if (!r.pass) console.log(`        expected ${JSON.stringify(r.expected)}, got ${JSON.stringify(r.actual)}`);
		}
		for (const e of errors) console.log(`page error: ${e}`);
		passed += results.filter((r) => r.pass).length;
		failed += results.filter((r) => !r.pass).length;
		pageErrors += errors.length;
	}

	console.log(`\n${passed} passed, ${failed} failed`);
	process.exitCode = failed || pageErrors ? 1 : 0;
} finally {
	server?.close();
	if (dir) await rm(dir, { recursive: true, force: true });
}
