/**
 * `positionTools.addAnchor` builds a zero-height anchor in the deck and styles it
 * on the element itself. What has to hold:
 *
 *  - on a deck that has the page to itself, the anchor is fixed to the window's
 *    top or bottom edge;
 *  - on an embedded deck it is sticky, and what it holds stays at the deck's edge
 *    while the page scrolls and while the deck scrolls in scroll view, wherever
 *    in the deck the anchor ends up;
 *  - it follows Reveal's `rtl` option, also when `configure()` changes it;
 *  - `--toolkit-anchor-height` is the height of what the reader sees, so an
 *    element can fill it from edge to edge, also after the deck resizes;
 *  - print view hides it, unless the plugin keeps it;
 *  - anchors from two separately bundled copies do not affect each other.
 *
 * The positioning project measures the full matrix of decks, views and
 * directions; this is the toolkit's own check that the helper does its job.
 *
 * Runs in headless Chrome over the DevTools protocol against the built
 * `dist/plugintoolkit.mjs`. Run `npm run build` first; `npm test` does both.
 *
 *   node test/position-tools.test.mjs
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
const PORT = 4524;
const CDP_PORT = 9524;

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
  <section><h2>One</h2></section>
  <section><h2>Two</h2></section>
  <section><h2>Three</h2></section>
  <section><h2>Four</h2></section>`;

const PAGE = `<!doctype html>
<html><head><meta charset="utf-8"><title>position-tools fixture</title>
<link rel="stylesheet" href="./reveal.css">
<style>
  body { margin: 0; }
  .spacer { height: 900px; }
  /* What a plugin's own stylesheet does: place its element against the anchor. */
  .probe { position: absolute; width: 30px; height: 30px; background: #f0c; }
  [data-toolkit-anchor="top"] > .probe { top: 10px; inset-inline-end: 10px; }
  [data-toolkit-anchor="bottom"] > .probe { bottom: 10px; inset-inline-start: 10px; }
  /* What a side menu does: fill the height of what the reader sees, from either anchor. */
  .panel { position: absolute; width: 20px; height: var(--toolkit-anchor-height); background: #0cf; }
  [data-toolkit-anchor="top"] > .panel { top: 0; inset-inline-start: 0; }
  [data-toolkit-anchor="bottom"] > .panel { bottom: 0; inset-inline-end: 0; }
</style>
</head>
<body>
  <script type="importmap">{"imports":{"deepmerge":"./deepmerge.mjs"}}</script>
  <script type="module">
    import Reveal from './reveal.mjs';
    import { positionTools } from './plugintoolkit.mjs';
    import { positionTools as positionToolsB } from './plugintoolkit-copy.mjs';

    const SLIDES = ${JSON.stringify(SLIDES)};
    const base = { hash: false, transition: 'none', backgroundTransition: 'none', controlsTutorial: false };
    const params = new URLSearchParams(location.search);
    const which = params.get('case');

    // Two plugins, each with its own bundled copy: one adds the top anchor, the other the bottom one.
    const plugins = (extra = {}) => [
      { id: 'anchor-a', init: (deck) => { const a = positionTools.addAnchor(deck, { edge: 'top', className: 'plugin-a', ...extra }); a.innerHTML = '<div class="probe"></div><div class="panel"></div>'; } },
      { id: 'anchor-b', init: (deck) => { const a = positionToolsB.addAnchor(deck, { edge: 'bottom', zIndex: 7, ...extra }); a.innerHTML = '<div class="probe"></div><div class="panel"></div>'; } },
    ];
    const addDeck = (css) => {
      const el = document.createElement('div');
      el.className = 'reveal';
      el.style.cssText = css;
      el.innerHTML = '<div class="slides">' + SLIDES + '</div>';
      document.body.appendChild(el);
      return el;
    };

    if (which === 'fullpage') {
      const deck = new Reveal(addDeck(''), { ...base, plugins: plugins() });
      deck.initialize().then(() => { window.deck = deck; });
    }

    if (which === 'embedded') {
      document.body.insertAdjacentHTML('beforeend', '<div class="spacer"></div>');
      // Narrow, so Reveal puts it in scroll view.
      const deck = new Reveal(addDeck('width: 400px; height: 300px; margin: 0 auto;'), { ...base, embedded: true, plugins: plugins() });
      document.body.insertAdjacentHTML('beforeend', '<div class="spacer"></div>');
      deck.initialize().then(() => { window.deck = deck; });
    }

    if (which === 'print') {
      const deck = new Reveal(addDeck(''), { ...base, plugins: plugins(params.get('keep') ? { print: 'keep' } : {}) });
      deck.initialize().then(() => { window.deck = deck; });
    }
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
		`--user-data-dir=${join(tmpdir(), 'plugintoolkit-cdp-anchors')}`, 'about:blank'
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

const COMMON = `
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const results = [];
  const check = (name, expected, actual) =>
    results.push({ name, expected, actual, pass: JSON.stringify(expected) === JSON.stringify(actual) });

  const R = window.deck;
  const deckEl = R.getRevealElement();
  const anchor = edge => deckEl.querySelector(':scope > [data-toolkit-anchor="' + edge + '"]');
  const probe = edge => anchor(edge).querySelector('.probe').getBoundingClientRect();
  const css = (el, prop) => getComputedStyle(el).getPropertyValue(prop);
  const round = n => Math.round(n);
  // What the reader sees of the deck: inside its border.
  const box = () => {
    const v = R.getViewportElement();
    const r = v.getBoundingClientRect();
    return { top: r.top + v.clientTop, left: r.left + v.clientLeft, right: r.left + v.clientLeft + v.clientWidth, bottom: r.top + v.clientTop + v.clientHeight };
  };
  // Probe offsets from the edges of that box.
  const offsets = () => {
    const b = box(), t = probe('top'), btm = probe('bottom');
    return { topTop: round(t.top - b.top), topEnd: round(b.right - t.right), bottomBottom: round(b.bottom - btm.bottom), bottomStart: round(btm.left - b.left) };
  };
  // How far each panel stays from the top and the bottom of that box: nothing, when it fills it.
  const panels = () => {
    const b = box();
    const gaps = edge => { const r = anchor(edge).querySelector('.panel').getBoundingClientRect(); return [round(r.top - b.top), round(b.bottom - r.bottom)]; };
    return { top: gaps('top'), bottom: gaps('bottom') };
  };
  const heightVar = edge => anchor(edge).style.getPropertyValue('--toolkit-anchor-height');
`;

const fail = `.catch(e => JSON.stringify([{ name: 'suite threw: ' + (e && e.message || e), expected: 'no exception', actual: 'exception', pass: false }]))`;

const EXPECTED = { topTop: 10, topEnd: 10, bottomBottom: 10, bottomStart: 10 };
const FILLED = { top: [0, 0], bottom: [0, 0] };

const SUITE_FULLPAGE = `(async () => {
  ${COMMON}
  check('two copies add two anchors, direct children of the deck', ['top', 'bottom'],
    Array.from(deckEl.querySelectorAll(':scope > [data-toolkit-anchor]')).map(a => a.dataset.toolkitAnchor));
  check('the class a plugin asks for is on its anchor', true, anchor('top').classList.contains('plugin-a'));
  check('fixed on a deck that has the page to itself', ['fixed', 'fixed'], [css(anchor('top'), 'position'), css(anchor('bottom'), 'position')]);
  check('zero height', [0, 0], [anchor('top').offsetHeight, anchor('bottom').offsetHeight]);
  check('z-index: the default, and the one asked for', ['2', '7'], [css(anchor('top'), 'z-index'), css(anchor('bottom'), 'z-index')]);
  check('what the anchors hold sits at the window edges', ${JSON.stringify(EXPECTED)}, offsets());
  check('--toolkit-anchor-height is the window height, on both anchors', [innerHeight + 'px', innerHeight + 'px'], [heightVar('top'), heightVar('bottom')]);
  check('a panel with that height fills the window, from either anchor', ${JSON.stringify(FILLED)}, panels());
  check('nothing a stylesheet adds to the page is needed', 0, document.querySelectorAll('style[data-toolkit], link[data-toolkit]').length);

  R.configure({ rtl: true }); await wait(100);
  check('configure({ rtl: true }): the anchors turn right to left', ['rtl', 'rtl'], [css(anchor('top'), 'direction'), css(anchor('bottom'), 'direction')]);
  const b = box(), t = probe('top'), btm = probe('bottom');
  check('and start and end swap sides', { topEndFromLeft: 10, bottomStartFromRight: 10 },
    { topEndFromLeft: round(t.left - b.left), bottomStartFromRight: round(b.right - btm.right) });

  R.configure({ rtl: false }); await wait(100);
  check('configure({ rtl: false }): back to left to right', ['ltr', ${JSON.stringify(EXPECTED)}], [css(anchor('top'), 'direction'), offsets()]);

  return JSON.stringify(results);
})()${fail}`;

const SUITE_EMBEDDED = `(async () => {
  ${COMMON}
  check('the deck is embedded and in scroll view', [true, true], [R.getViewportElement() === deckEl, deckEl.classList.contains('reveal-scroll')]);
  check('sticky on an embedded deck', ['sticky', 'sticky'], [css(anchor('top'), 'position'), css(anchor('bottom'), 'position')]);

  deckEl.scrollIntoView({ block: 'center' }); await wait(300);
  check('at rest: what the anchors hold sits at the deck edges', ${JSON.stringify(EXPECTED)}, offsets());
  check('--toolkit-anchor-height is the deck height', deckEl.clientHeight + 'px', heightVar('top'));
  check('at rest: the panels fill the deck', ${JSON.stringify(FILLED)}, panels());

  deckEl.scrollTop = round((deckEl.scrollHeight - deckEl.clientHeight) / 2); await wait(500);
  check('the deck scrolled', true, deckEl.scrollTop > 0);
  check('deck scrolled: still at the deck edges', ${JSON.stringify(EXPECTED)}, offsets());
  check('deck scrolled: the panels still fill the deck', ${JSON.stringify(FILLED)}, panels());

  window.scrollBy(0, 120); await wait(300);
  check('page scrolled: still at the deck edges', ${JSON.stringify(EXPECTED)}, offsets());
  check('page scrolled: the panels still fill the deck', ${JSON.stringify(FILLED)}, panels());

  // Where another plugin, or this one, might insert it instead.
  deckEl.insertBefore(anchor('bottom'), deckEl.firstChild);
  deckEl.append(anchor('top'));
  await wait(300);
  check('order swapped: still at the deck edges', ${JSON.stringify(EXPECTED)}, offsets());

  deckEl.scrollTop = deckEl.scrollHeight; await wait(500);
  check('order swapped, deck scrolled to the end: still at the deck edges', ${JSON.stringify(EXPECTED)}, offsets());

  deckEl.style.height = '240px'; await wait(500);
  check('the deck is shorter: --toolkit-anchor-height follows', ['240px', '240px'], [heightVar('top'), heightVar('bottom')]);
  check('the deck is shorter: the panels still fill it', ${JSON.stringify(FILLED)}, panels());

  return JSON.stringify(results);
})()${fail}`;

const SUITE_PRINT = `(async () => {
  ${COMMON}
  check('Reveal is in print view', true, document.documentElement.classList.contains('print-pdf'));
  check('print view: both anchors hidden', ['none', 'none'], [css(anchor('top'), 'display'), css(anchor('bottom'), 'display')]);
  return JSON.stringify(results);
})()${fail}`;

const SUITE_PRINT_KEEP = `(async () => {
  ${COMMON}
  check('Reveal is in print view', true, document.documentElement.classList.contains('print-pdf'));
  check("print: 'keep': both anchors shown", ['block', 'block'], [css(anchor('top'), 'display'), css(anchor('bottom'), 'display')]);
  return JSON.stringify(results);
})()${fail}`;

// Reveal merges query-string options into the config as they are typed there, so this is `rtl: 1`, not `true`.
const SUITE_RTL_FROM_QUERY = `(async () => {
  ${COMMON}
  check('the config has rtl from the query string', 1, R.getConfig().rtl);
  check('rtl from the start: both anchors right to left', ['rtl', 'rtl'], [css(anchor('top'), 'direction'), css(anchor('bottom'), 'direction')]);
  const b = box(), t = probe('top'), btm = probe('bottom');
  check('and start and end on the swapped sides', { topEndFromLeft: 10, bottomStartFromRight: 10 },
    { topEndFromLeft: round(t.left - b.left), bottomStartFromRight: round(b.right - btm.right) });
  return JSON.stringify(results);
})()${fail}`;

const CASES = [
	{ title: 'a deck that has the page to itself', query: 'case=fullpage', suite: SUITE_FULLPAGE },
	{ title: 'rtl from the start, through ?rtl=1', query: 'case=fullpage&rtl=1', suite: SUITE_RTL_FROM_QUERY },
	{ title: 'an embedded deck in scroll view, on a page that scrolls', query: 'case=embedded', suite: SUITE_EMBEDDED },
	{ title: 'print view', query: 'print-pdf&case=print', suite: SUITE_PRINT },
	{ title: "print view, with print: 'keep'", query: 'print-pdf&case=print&keep=1', suite: SUITE_PRINT_KEEP },
];

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
