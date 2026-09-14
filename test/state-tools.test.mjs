/**
 * `stateTools.addSlideStates` makes `data-state` work in scroll view, where Reveal
 * does not apply it, and leaves the regular view to Reveal. What has to hold:
 *
 *  - in scroll view, the slide on screen has its states on the viewport, a stack's
 *    state included, and each new state fires its event once;
 *  - switching between the two views hands the states over in both directions
 *    without leaving any behind, and without firing events a second time;
 *  - two embedded decks keep their states apart;
 *  - installed from two separately bundled copies, it still installs once.
 *
 * Scroll view is switched the way a real deck switches: by changing an embedded
 * deck's width, so that Reveal's own resize handling turns it on or off.
 *
 * These states only exist in a browser, so the test drives real headless Chrome
 * over the DevTools protocol against the built `dist/plugintoolkit.mjs`. Run
 * `npm run build` first; `npm test` does both.
 *
 *   node test/state-tools.test.mjs
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
const PORT = 4523;
const CDP_PORT = 9523;

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
  <section data-label="intro"><h2>Intro</h2></section>
  <section data-label="state" data-state="s-one two"><h2>Two states</h2></section>
  <section data-label="stack" data-state="stack-state">
    <section data-label="v0"><h2>Stack 1</h2></section>
    <section data-label="v1" data-state="child-state"><h2>Stack 2</h2></section>
  </section>
  <section data-label="end"><h2>End</h2></section>`;

const PAGE = `<!doctype html>
<html><head><meta charset="utf-8"><title>state-tools fixture</title>
<link rel="stylesheet" href="./reveal.css">
<style>body { margin: 0; }</style>
</head>
<body>
  <script type="importmap">{"imports":{"deepmerge":"./deepmerge.mjs"}}</script>
  <script type="module">
    import Reveal from './reveal.mjs';
    import { stateTools } from './plugintoolkit.mjs';
    import { stateTools as stateToolsB } from './plugintoolkit-copy.mjs';

    // Collected, so a test can count the helper's warnings.
    window.__warns = [];
    const warn = console.warn.bind(console);
    console.warn = (...args) => { window.__warns.push(args.join(' ')); warn(...args); };

    const SLIDES = ${JSON.stringify(SLIDES)};
    const base = { hash: false, transition: 'none', backgroundTransition: 'none', controlsTutorial: false };
    // Two plugins, each with its own bundled copy, both asking from their init.
    const plugins = () => [
      { id: 'states-a', init: (deck) => stateTools.addSlideStates(deck) },
      { id: 'states-b', init: (deck) => stateToolsB.addSlideStates(deck) },
    ];
    const addDeck = (css) => {
      const el = document.createElement('div');
      el.className = 'reveal';
      el.style.cssText = css;
      el.innerHTML = '<div class="slides">' + SLIDES + '</div>';
      document.body.appendChild(el);
      return el;
    };

    const which = new URLSearchParams(location.search).get('case');

    if (which === 'scroll-start') {
      const deck = new Reveal(addDeck(''), { ...base, view: 'scroll', plugins: plugins() });
      deck.initialize().then(() => { window.deck = deck; });
    }

    if (which === 'embedded') {
      const a = new Reveal(addDeck('width: 800px; height: 400px; margin: 24px auto;'), { ...base, embedded: true, plugins: plugins() });
      const b = new Reveal(addDeck('width: 800px; height: 400px; margin: 24px auto;'), { ...base, embedded: true, plugins: plugins() });
      Promise.all([a.initialize(), b.initialize()]).then(() => { window.deckB = b; window.deck = a; });
    }

    if (which === 'late') {
      // Narrow from the start, so it is in scroll view before anything asks.
      const deck = new Reveal(addDeck('width: 400px; height: 400px; margin: 24px auto;'), { ...base, embedded: true });
      deck.initialize().then(() => { stateTools.addSlideStates(deck); window.deck = deck; });
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
	// Scroll view lays its pages out with Reveal's own stylesheet.
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
		`--user-data-dir=${join(tmpdir(), 'plugintoolkit-cdp-states')}`, 'about:blank'
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
	for (let i = 0; i < 80; i++) {
		const r = await send('Runtime.evaluate', { expression: '!!window.deck', returnByValue: true });
		if (r.result?.result?.value) break;
		await sleep(100);
	}

	const out = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
	ws.close();
	proc.kill();
	// Let this Chrome let go of its profile before the next case starts one.
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

  const STATES = ['s-one', 'two', 'stack-state', 'child-state'];
  const hostOf = deck => deck.getViewportElement() || deck.getRevealElement();
  const statesOn = deck => STATES.filter(s => hostOf(deck).classList.contains(s));
  const inScroll = deck => hostOf(deck).classList.contains('reveal-scroll');
  const warnings = () => window.__warns.filter(w => w.includes('addSlideStates')).length;
  const slideEl = (deck, label) => deck.getRevealElement().querySelector('section[data-label="' + label + '"]');

  const until = async (fn, ms = 5000) => {
    const started = Date.now();
    while (Date.now() - started < ms) { if (fn()) return true; await wait(50); }
    return false;
  };

  // Counts each state's event on one deck.
  const counter = deck => {
    const n = {};
    for (const s of STATES) { n[s] = 0; deck.on(s, () => n[s]++); }
    return n;
  };

  // To a slide's own page. slide() in scroll view stops a page short past the middle of a deck, so it is not used here.
  const scrollTo = async (deck, label) => {
    const v = deck.getViewportElement();
    const page = slideEl(deck, label).closest('.scroll-page');
    v.scrollTop = Math.round(page.getBoundingClientRect().top - v.getBoundingClientRect().top + v.scrollTop) + 1;
    await wait(700);
  };

  // Reveal switches an embedded deck to scroll view by its width, on resize.
  const setWidth = async (deck, px, wantScroll) => {
    deck.getRevealElement().style.width = px + 'px';
    window.dispatchEvent(new Event('resize'));
    const switched = await until(() => inScroll(deck) === wantScroll &&
      (!wantScroll || !!deck.getRevealElement().querySelector('.scroll-page')));
    await wait(600);
    return switched;
  };
`;

const fail = `.catch(e => JSON.stringify([{ name: 'suite threw: ' + (e && e.message || e), expected: 'no exception', actual: 'exception', pass: false }]))`;

const SUITE_SCROLL_START = `(async () => {
  ${COMMON}
  const R = window.deck;
  const n = counter(R);

  check('starts in scroll view', true, inScroll(R));
  check('installed from init: no warning', 0, warnings());
  check('the stack state is copied onto both vertical slides', ['stack-state', 'stack-state'],
    ['v0', 'v1'].map(l => slideEl(R, l).getAttribute('data-toolkit-stack-state')));

  await scrollTo(R, 'state');
  check('a slide with two states gets both', ['s-one', 'two'], statesOn(R));
  check('each new state fires its event once, with two installs', { 's-one': 1, two: 1 }, { 's-one': n['s-one'], two: n.two });

  await scrollTo(R, 'v0');
  check('the first slide of a stack gets the stack state', ['stack-state'], statesOn(R));

  await scrollTo(R, 'v1');
  check('the second slide gets the stack state and its own', ['stack-state', 'child-state'], statesOn(R));
  check('moving within the stack does not fire the stack state again', { 'stack-state': 1, 'child-state': 1 },
    { 'stack-state': n['stack-state'], 'child-state': n['child-state'] });

  await scrollTo(R, 'end');
  check('a slide without states: every state is off', [], statesOn(R));

  await scrollTo(R, 'state');
  check('coming back fires the states again', { 's-one': 2, two: 2 }, { 's-one': n['s-one'], two: n.two });

  return JSON.stringify(results);
})()${fail}`;

const SUITE_EMBEDDED = `(async () => {
  ${COMMON}
  const A = window.deck, B = window.deckB;
  const nA = counter(A);

  check('both decks start in the regular view', [false, false], [inScroll(A), inScroll(B)]);

  A.slide(1, 0); await wait(400);
  check('regular view: Reveal applies the states, on deck A only', { A: ['s-one', 'two'], B: [] }, { A: statesOn(A), B: statesOn(B) });
  check('regular view: each event fires once, not doubled', { 's-one': 1, two: 1 }, { 's-one': nA['s-one'], two: nA.two });

  check('narrowing deck A switches it to scroll view', true, await setWidth(A, 400, true));
  check('into scroll view: the slide on screen keeps its states', ['s-one', 'two'], statesOn(A));
  check('into scroll view: their events do not fire again', { 's-one': 1, two: 1 }, { 's-one': nA['s-one'], two: nA.two });
  check('deck B stays in the regular view', false, inScroll(B));

  await scrollTo(A, 'end');
  check('scroll view: moving on takes the states that were taken over off', [], statesOn(A));

  await scrollTo(A, 'v1');
  check('scroll view: a stack slide on an embedded deck', ['stack-state', 'child-state'], statesOn(A));
  check("deck B never gets deck A's states", [], statesOn(B));

  check('widening deck A switches it back', true, await setWidth(A, 800, false));
  check('out of scroll view: the slide on screen keeps its states', ['stack-state', 'child-state'], statesOn(A));
  check('the stack state survives Reveal rebuilding the slides', 'stack-state',
    slideEl(A, 'v1').getAttribute('data-toolkit-stack-state'));

  A.slide(0, 0); await wait(400);
  check('regular view after the switch: Reveal takes the states off', [], statesOn(A));
  A.slide(1, 0); await wait(400);
  check('regular view after the switch: Reveal puts them back', ['s-one', 'two'], statesOn(A));

  // In again on a slide with states, out on one without.
  check('narrowing deck A again', true, await setWidth(A, 400, true));
  await scrollTo(A, 'end');
  check('widening on a slide without states', true, await setWidth(A, 800, false));
  check('out of scroll view on a slide without states: nothing left behind', [], statesOn(A));
  A.slide(1, 0); await wait(400);
  check('and Reveal still applies them afterwards', ['s-one', 'two'], statesOn(A));

  check('deck B untouched throughout', { states: [], scroll: false }, { states: statesOn(B), scroll: inScroll(B) });
  check('no warning for decks set up from init', 0, warnings());

  return JSON.stringify(results);
})()${fail}`;

const SUITE_LATE = `(async () => {
  ${COMMON}
  const A = window.deck;

  check('the deck is in scroll view before the helper is installed', true, inScroll(A));
  check('installed late, on a deck with stacks: one warning', 1, warnings());

  await scrollTo(A, 'state');
  check('installed late: a slide still gets its own states', ['s-one', 'two'], statesOn(A));

  await scrollTo(A, 'v1');
  check('installed late: the stack state is not known yet', ['child-state'], statesOn(A));

  check('widening switches it to the regular view', true, await setWidth(A, 800, false));
  check('narrowing switches it back', true, await setWidth(A, 400, true));
  await scrollTo(A, 'end');
  await scrollTo(A, 'v1');
  check('after one switch back, the stack state is known', ['stack-state', 'child-state'], statesOn(A));
  check('still one warning', 1, warnings());

  return JSON.stringify(results);
})()${fail}`;

const CASES = [
	{ title: 'starting in scroll view', query: 'scroll-start', suite: SUITE_SCROLL_START },
	{ title: 'two embedded decks, switching views', query: 'embedded', suite: SUITE_EMBEDDED },
	{ title: 'installed after scroll view started', query: 'late', suite: SUITE_LATE },
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
		const { value, errors } = await evaluate(`http://127.0.0.1:${PORT}/?case=${c.query}`, c.suite);
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
