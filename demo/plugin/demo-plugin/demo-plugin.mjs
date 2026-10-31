// ../src/utils/plugin-tools/config-tools.ts
var e = (e) => {
	if (typeof e != "object" || !e) return !1;
	let t = Object.getPrototypeOf(e);
	return t === Object.prototype || t === null;
}, t = /* @__PURE__ */ new Set([
	"__proto__",
	"constructor",
	"prototype"
]), n = (...r) => {
	let i = {};
	for (let a of r) if (e(a)) for (let r of Object.keys(a)) {
		if (t.has(r)) continue;
		let o = a[r];
		i[r] = e(o) ? n(i[r], o) : o;
	}
	return i;
}, r = [
	".js",
	".min.js",
	".mjs"
], i = (() => {
	let e = import.meta;
	if (typeof e?.url == "string" && e.url !== "") return e.url;
	let t = typeof document < "u" ? document.currentScript : null;
	return t && "src" in t && t.src ? t.src : "";
})(), a = (e) => {
	let t = e.lastIndexOf("/");
	return t === -1 ? "" : e.slice(0, t + 1);
}, o = (e) => {
	let t = e.split(/[?#]/)[0];
	return t.slice(t.lastIndexOf("/") + 1);
}, s = (e, t) => r.some((n) => e === `${t}${n}`), c = [
	/\/@fs\//,
	/\/@id\//,
	/\/\.vite\/deps\//,
	/[?&][vt]=/
], l = (e) => c.some((t) => t.test(e)), u = (e) => {
	if (typeof document < "u") {
		let t = r.map((t) => `script[src$="${e}${t}"]`).join(", "), n = document.querySelector(t)?.getAttribute("src");
		if (n) return { directory: a(n) };
	}
	return i && !l(i) && s(o(i), e) ? { directory: a(i) } : { directory: null };
}, ee = (e) => u(e).directory !== null, d = /* @__PURE__ */ new Map(), te = (e = "") => {
	let t = d.get(e);
	if (t) return t;
	let n = typeof window < "u", r = typeof document < "u", i = import.meta, a = !1;
	try {
		a = typeof module < "u" && !!module?.hot;
	} catch {}
	let o = !1;
	try {
		o = !!i?.hot;
	} catch {}
	let s = a || o, c = !1;
	try {
		c = i?.env?.DEV === !0;
	} catch {}
	let l = e !== "" && ee(e), u = {
		hasResolvableSource: l,
		hasWindow: n,
		hasDocument: r,
		isBundled: !l,
		isDevelopment: s || c,
		hasHMR: s,
		isViteDev: c
	};
	return d.set(e, u), u;
}, ne = class {
	defaultConfig;
	pluginInit;
	pluginId;
	mergedConfig = null;
	userConfigData = null;
	data = {};
	constructor(e, t, n) {
		typeof e == "string" ? (this.pluginId = e, this.pluginInit = t, this.defaultConfig = n || {}) : (this.pluginId = e.id, this.pluginInit = e.init, this.defaultConfig = e.defaultConfig || {});
	}
	initializeConfig(e) {
		let t = this.defaultConfig, r = e.getConfig()[this.pluginId] || {};
		this.userConfigData = r, this.mergedConfig = n(t, r);
	}
	getCurrentConfig() {
		if (!this.mergedConfig) throw Error("Plugin configuration has not been initialized");
		return this.mergedConfig;
	}
	getData() {
		return Object.keys(this.data).length > 0 ? this.data : void 0;
	}
	get userConfig() {
		return this.userConfigData || {};
	}
	getEnvironmentInfo = () => te(this.pluginId);
	init(e) {
		if (this.initializeConfig(e), this.pluginInit) return this.pluginInit(this, e, this.getCurrentConfig());
	}
	createInterface(e = {}) {
		return {
			id: this.pluginId,
			init: (e) => this.init(e),
			getConfig: () => this.getCurrentConfig(),
			getData: () => this.getData(),
			...e
		};
	}
}, f = "data-css-id", p = (e, t) => new Promise((n, r) => {
	let i = document.createElement("link");
	i.rel = "stylesheet", i.href = t, i.setAttribute(f, e);
	let a = setTimeout(() => {
		i.parentNode && i.parentNode.removeChild(i), r(/* @__PURE__ */ Error(`[${e}] Timeout loading CSS from: ${t}`));
	}, 5e3);
	i.onload = () => {
		clearTimeout(a), n();
	}, i.onerror = () => {
		clearTimeout(a), i.parentNode && i.parentNode.removeChild(i), r(/* @__PURE__ */ Error(`[${e}] Failed to load CSS from: ${t}`));
	}, document.head.appendChild(i);
}), re = (e) => document.querySelectorAll(`[${f}="${e}"]`).length > 0, m = 1e4, h = (e) => new Promise((t) => {
	if (g(e)) return t(!0);
	if (typeof MutationObserver > "u") return t(!1);
	let n = !1, r = (e) => {
		n || (n = !0, i.disconnect(), clearTimeout(o), window.removeEventListener("load", a), t(e));
	}, i = new MutationObserver(() => {
		g(e) && r(!0);
	});
	i.observe(document.documentElement, {
		childList: !0,
		subtree: !0,
		attributeFilter: ["href", "rel"]
	});
	let a = () => requestAnimationFrame(() => r(g(e)));
	document.readyState === "complete" ? a() : window.addEventListener("load", a, { once: !0 });
	let o = setTimeout(() => r(g(e)), m);
}), g = (e) => {
	if (re(e)) return !0;
	try {
		return window.getComputedStyle(document.documentElement).getPropertyValue(`--cssimported-${e}`).trim() !== "";
	} catch {
		return !1;
	}
}, ie = "--r-main-color", _ = () => {
	if (typeof document > "u" || typeof window > "u") return !1;
	try {
		return getComputedStyle(document.documentElement).getPropertyValue(ie).trim() !== "";
	} catch {
		return !1;
	}
}, ae = (e = 1e3) => _() ? Promise.resolve(!0) : new Promise((t) => {
	let n = Date.now() + e, r = () => {
		_() ? t(!0) : Date.now() >= n ? t(!1) : setTimeout(r, 16);
	};
	r();
}), v = ((e) => new Proxy(e, { get: (e, t) => {
	if (t in e) return e[t];
	let n = t.toString();
	if (typeof console[n] == "function") return (...t) => {
		e.debugLog(n, ...t);
	};
} }))(new class {
	debugMode = !1;
	label = "DEBUG";
	groupDepth = 0;
	pending = null;
	emit(e, t) {
		if (this.pending) {
			this.pending.push([e, t]);
			return;
		}
		let n = typeof e == "function" ? e : console[e];
		typeof n == "function" && n.call(console, ...t);
	}
	flush() {
		let e = this.pending;
		if (this.pending = null, e) for (let [t, n] of e) this.emit(t, n);
	}
	initialize(e, t = "DEBUG") {
		this.debugMode = e, this.label = t;
	}
	group = (...e) => {
		this.debugMode && this.groupDepth === 0 && !this.pending && (this.pending = []), this.debugLog("group", ...e), this.groupDepth++;
	};
	groupCollapsed = (...e) => {
		this.debugMode && this.groupDepth === 0 && !this.pending && (this.pending = []), this.debugLog("groupCollapsed", ...e), this.groupDepth++;
	};
	groupEnd = () => {
		this.groupDepth > 0 && (this.groupDepth--, this.debugLog("groupEnd"), this.groupDepth === 0 && this.flush());
	};
	error = (...e) => {
		let t = this.debugMode;
		this.debugMode = !0, this.formatAndLog(console.error, e), this.debugMode = t;
	};
	table = (e, t, n) => {
		if (this.debugMode) try {
			typeof e == "string" && t !== void 0 && typeof t != "string" ? (this.groupDepth === 0 ? this.emit("log", [`[${this.label}]: ${e}`]) : this.emit("log", [e]), n ? this.emit("table", [t, n]) : this.emit("table", [t])) : (this.groupDepth === 0 && this.emit("log", [`[${this.label}]: Table data`]), typeof t == "object" && Array.isArray(t) ? this.emit("table", [e, t]) : this.emit("table", [e]));
		} catch (t) {
			this.emit("error", [`[${this.label}]: Error showing table:`, t]), this.emit("log", [`[${this.label}]: Raw data:`, e]);
		}
	};
	formatAndLog = (e, t) => {
		if (this.debugMode) try {
			this.groupDepth > 0 ? this.emit(e, t) : t.length > 0 && typeof t[0] == "string" ? this.emit(e, [`[${this.label}]: ${t[0]}`, ...t.slice(1)]) : this.emit(e, [`[${this.label}]:`, ...t]);
		} catch (e) {
			this.emit("error", [`[${this.label}]: Error in logging:`, e]), this.emit("log", [`[${this.label}]: Original log data:`, ...t]);
		}
	};
	debugLog(e, ...t) {
		let n = console[e];
		!this.debugMode && e !== "error" || typeof n != "function" || (e === "group" || e === "groupCollapsed" ? t.length > 0 && typeof t[0] == "string" ? this.emit(e, [`[${this.label}]: ${t[0]}`, ...t.slice(1)]) : this.emit(e, [`[${this.label}]:`, ...t]) : e === "groupEnd" ? this.emit(e, []) : e === "table" ? t.length === 1 ? this.table(t[0]) : t.length === 2 ? (t[0], this.table(t[0], t[1])) : t.length >= 3 && this.table(t[0], t[1], t[2]) : this.groupDepth > 0 ? this.emit(e, t) : t.length > 0 && typeof t[0] == "string" ? this.emit(e, [`[${this.label}]: ${t[0]}`, ...t.slice(1)]) : this.emit(e, [`[${this.label}]:`, ...t]));
	}
}()), y = /* @__PURE__ */ new Set(), b = (e, t) => {
	let n = `${e}::${t}`;
	y.has(n) || (y.add(n), console.warn(`[${e}] ${t}`));
}, x = (e) => [`dist/plugin/${e}/${e}.css`, `plugin/${e}/${e}.css`], S = (e) => typeof e == "string" && e.trim() !== "", C = async (e, t) => {
	let { cssautoload: n, csspath: r, debug: i = !1 } = t;
	if (n === !1 || r === !1) return i && console.log(`[${e}] CSS loading is switched off`), { status: "skipped" };
	if (S(r)) {
		let t = r.trim(), n = g(e), a = n && !!document.querySelector(`[data-css-id="${e}"]`);
		try {
			return await p(e, t), i && console.log(`[${e}] CSS loaded from: ${t}`), n && b(e, `Loaded CSS from ${t}, but a stylesheet for this plugin was already on the page (${a ? "a tagged <link>" : "an import or inline <style>"}) — csspath adds one, it cannot remove one. Both are live and the cascade decides. Remove the other import or <link>, or drop csspath.`), {
				status: "loaded",
				path: t
			};
		} catch {
			return console.warn(`[${e}] Could not load CSS from: ${t}`), {
				status: "failed",
				path: t
			};
		}
	}
	if (g(e)) return i && console.log(`[${e}] CSS is already imported, skipping`), { status: "present" };
	let { directory: a } = u(e);
	if (a !== null || n === !0) {
		let t = [...a === null ? [] : [`${a}${e}.css`], ...x(e)].filter((e, t, n) => n.indexOf(e) === t);
		for (let n of t) try {
			return await p(e, n), i && console.log(`[${e}] CSS loaded from: ${n}`), {
				status: "loaded",
				path: n
			};
		} catch {
			i && console.log(`[${e}] No CSS at: ${n}`);
		}
		return console.warn(`[${e}] Could not load CSS. Tried: ${t.join(", ")}. Import the stylesheet yourself, or set csspath to where it is.`), { status: "failed" };
	}
	return h(e).then((t) => {
		t || b(e, `CSS could not be autoloaded here, because the plugin is part of a bundle. Import it once in your own code: import 'reveal.js-${e}/${e}.css'`);
	}), { status: "advised" };
};
async function oe(e, t) {
	if ("getEnvironmentInfo" in e && t) {
		let n = e, r = n.userConfig, i = "cssautoload" in r && r.cssautoload !== "auto" ? t.cssautoload : void 0;
		return C(n.pluginId, {
			...t,
			cssautoload: i
		});
	}
	let { id: n, cssautoload: r, csspath: i, debug: a } = e;
	return C(n, {
		cssautoload: r === "auto" ? void 0 : r,
		csspath: i,
		debug: a
	});
}
// ../src/utils/plugin-tools/event-tools.ts
var w = Symbol.for("reveal.js-plugintoolkit.directionEvents"), T = Symbol.for("reveal.js-plugintoolkit.scrollModeEvents"), E = (e, t, n) => {
	Object.defineProperty(e, t, {
		value: n,
		configurable: !0,
		enumerable: !1,
		writable: !1
	});
}, se = (e) => {
	if (e[w]) return;
	let [t, n] = [0, 0];
	e.on("slidechanged", (r) => {
		let { indexh: i, indexv: a, previousSlide: o, currentSlide: s } = r;
		i !== t && e.dispatchEvent({
			type: "slidechanged-h",
			data: {
				previousSlide: o,
				currentSlide: s,
				indexh: i,
				indexv: a
			}
		}), a !== n && i === t && e.dispatchEvent({
			type: "slidechanged-v",
			data: {
				previousSlide: o,
				currentSlide: s,
				indexh: i,
				indexv: a
			}
		}), [t, n] = [i, a];
	}), E(e, w, !0);
}, ce = (e) => {
	if (e[T]) return () => {};
	let t = e.getViewportElement();
	if (!t) return console.warn("[plugintoolkit]: Could not find viewport element"), () => {};
	let n = () => t.classList.contains("reveal-scroll"), r = n(), i = new MutationObserver(() => {
		let t = n();
		if (t !== r) {
			let n = e.getCurrentSlide(), { h: i, v: a } = e.getIndices();
			e.dispatchEvent({
				type: t ? "scrollmode-enter" : "scrollmode-exit",
				data: {
					currentSlide: n,
					previousSlide: null,
					indexh: i,
					indexv: a
				}
			}), r = t;
		}
	});
	i.observe(t, {
		attributes: !0,
		attributeFilter: ["class"]
	});
	let a = () => {
		i.disconnect(), delete e[T];
	};
	return E(e, T, a), a;
}, D = (e) => e instanceof HTMLElement && e.tagName === "SECTION", le = (e) => D(e) ? Array.from(e.children).some((e) => e instanceof HTMLElement && e.tagName === "SECTION") : !1, ue = (e) => D(e) ? e.parentElement instanceof HTMLElement && e.parentElement.tagName === "SECTION" : !1, de = (e) => D(e) ? ue(e) ? "vertical" : le(e) ? "stack" : "horizontal" : "invalid", O = Symbol.for("reveal.js-plugintoolkit.themeColor"), k = "has-light-background", A = "has-dark-background", j = "--c-theme-color", M = "--c-theme-heading-color", N = {
	text: "section",
	heading: "h1"
}, P = "c-theme-inverted", F = "reveal-scroll", I = "stack", L = (e, t, n) => {
	Object.defineProperty(e, t, {
		value: n,
		configurable: !0,
		enumerable: !1,
		writable: !1
	});
}, R = (e) => {
	let t = e.getElementsByClassName("slides")[0];
	if (!t) return null;
	let n = document.createElement("section"), r = document.createElement(N.heading);
	n.appendChild(r), t.appendChild(n);
	let i = () => ({
		text: getComputedStyle(n).getPropertyValue("color"),
		heading: getComputedStyle(r).getPropertyValue("color")
	}), a = i();
	n.classList.add(k);
	let o = i(), s = "dark";
	return o.text === a.text && o.heading === a.heading && (s = "light", n.classList.remove(k), n.classList.add(A), o = i()), n.remove(), {
		theme: s,
		text: {
			regular: a.text,
			inverse: o.text
		},
		heading: {
			regular: a.heading,
			inverse: o.heading
		}
	};
}, z = (e, t) => e?.classList.contains(t) ?? !1, B = (e, t, n) => {
	let r = z(n, F) ? n : t;
	if (z(r, k)) return "light";
	if (z(r, A)) return "dark";
	let i = e.getCurrentSlide?.()?.parentElement ?? null;
	if (i && z(i, I)) {
		if (z(i, k)) return "light";
		if (z(i, A)) return "dark";
	}
	return null;
}, V = (e, t, n) => {
	let r = B(e, t, e.getViewportElement());
	return n.theme === "dark" ? r === "light" : r === "dark";
}, H = (e, t, n) => {
	let r = (e) => n ? e.inverse : e.regular;
	e.style.setProperty(j, r(t.text)), e.style.setProperty(M, r(t.heading)), e.classList.toggle(P, n);
}, fe = async (e, { timeout: t = 1e3 }) => {
	let n = e.getRevealElement();
	if (!n) return null;
	let r = e.getViewportElement() ?? n;
	await ae(t);
	let i = R(n);
	if (!i) return null;
	let a = V(e, n, i);
	H(r, i, a);
	let o = () => {
		let t = V(e, n, i);
		t !== a && (a = t, H(r, i, t));
	}, s = new MutationObserver(o);
	return s.observe(n, {
		attributes: !0,
		attributeFilter: ["class"]
	}), r !== n && s.observe(r, {
		attributes: !0,
		attributeFilter: ["class"]
	}), e.on("slidechanged", o), i;
}, pe = (e, t = {}) => {
	let n = e[O];
	if (n) return n;
	let r = fe(e, t);
	return L(e, O, r), r;
}, U = Symbol.for("reveal.js-plugintoolkit.slideStates"), me = "reveal-scroll", W = "data-toolkit-stack-state", he = (e, t, n) => {
	Object.defineProperty(e, t, {
		value: n,
		configurable: !0,
		enumerable: !1,
		writable: !1
	});
}, G = (e) => (e ?? "").split(" ").filter(Boolean), K = (e) => Array.from(new Set(e)), q = (e) => e.classList.contains(me), J = (e) => {
	if (e.querySelector(".scroll-page")) return !1;
	for (let t of Array.from(e.querySelectorAll(".slides > section"))) {
		let e = t.querySelectorAll(":scope > section");
		if (!e.length) continue;
		let n = t.getAttribute("data-state");
		for (let t of Array.from(e)) n ? t.setAttribute(W, n) : t.removeAttribute(W);
	}
	return !0;
}, Y = (e) => {
	if (!e) return [];
	let t = e.parentElement;
	return K([...t?.tagName === "SECTION" ? G(t.getAttribute("data-state")) : G(e.getAttribute(W)), ...G(e.getAttribute("data-state"))]);
}, X = (e, t, n, { dispatch: r }) => {
	let i = Y(n);
	for (let e of t.applied) i.includes(e) || t.host.classList.remove(e);
	for (let n of i) t.host.classList.add(n), r && !t.applied.includes(n) && e.dispatchEvent({ type: n });
	t.applied = i;
}, Z = (e) => {
	e.warned || e.stacksRead || e.revealElement.querySelector(".scroll-page section[data-index-v]:not([data-index-v=\"0\"])") && (e.warned = !0, console.warn("[plugintoolkit]: addSlideStates was called after the deck had already switched to scroll view, so the states of stacks are unknown until it leaves scroll view once. Slides still get their own states. Call it from a plugin's init to avoid this."));
}, ge = (e) => {
	let t = e.getRevealElement();
	if (!t) return null;
	let n = e.getViewportElement() ?? t, r = q(n), i = {
		revealElement: t,
		host: n,
		inScrollView: r,
		applied: [],
		regularStates: r ? [] : Y(e.getCurrentSlide()),
		switching: !1,
		stacksRead: J(t),
		warned: !1
	};
	r && (Z(i), X(e, i, e.getCurrentSlide(), { dispatch: !1 }));
	let a = () => {
		let r = q(n);
		r !== i.inScrollView && (i.inScrollView = r, r ? (Z(i), i.applied = K([...i.applied, ...i.regularStates]), i.switching = !0, queueMicrotask(() => {
			i.switching = !1;
		}), X(e, i, e.getCurrentSlide(), { dispatch: !1 })) : (X(e, i, e.getCurrentSlide(), { dispatch: !1 }), i.applied = [], i.regularStates = Y(e.getCurrentSlide()), i.stacksRead = J(t) || i.stacksRead));
	};
	return new MutationObserver(a).observe(n, {
		attributes: !0,
		attributeFilter: ["class"]
	}), e.on("ready", () => {
		a(), i.inScrollView ? X(e, i, e.getCurrentSlide(), { dispatch: !1 }) : (i.regularStates = Y(e.getCurrentSlide()), i.stacksRead = J(t) || i.stacksRead);
	}), e.on("slidechanged", (t) => {
		a();
		let { currentSlide: n } = t, r = n ?? e.getCurrentSlide();
		i.inScrollView ? X(e, i, r, { dispatch: !i.switching }) : i.regularStates = Y(r);
	}), i;
}, _e = (e) => {
	if (e[U]) return;
	let t = ge(e);
	t && he(e, U, t);
}, ve = "data-toolkit-anchor", ye = "--toolkit-anchor-height", Q = (e) => e.getConfig(), be = (e) => Q(e).view === "print" || /print-pdf/i.test(window.location.search) || document.documentElement.classList.contains("print-pdf"), $ = (e, t, n, r, i) => {
	let { style: a } = t, o = r === "top";
	a.setProperty("display", i.print !== "keep" && be(e) ? "none" : "block"), a.setProperty("height", "0"), a.setProperty("margin", "0"), a.setProperty("padding", "0"), a.setProperty("z-index", String(i.zIndex ?? 2)), n ? (a.setProperty("position", "sticky"), a.setProperty("inset-inline", "auto"), a.setProperty("top", o ? "0" : "100%"), a.setProperty("bottom", o ? "100%" : "0")) : (a.setProperty("position", "fixed"), a.setProperty("inset-inline", "0"), a.setProperty("top", o ? "0" : "auto"), a.setProperty("bottom", o ? "auto" : "0")), Q(e).rtl ? a.setProperty("direction", "rtl") : a.removeProperty("direction");
}, xe = (e, t = {}) => {
	let n = e.getRevealElement();
	if (!n) return null;
	let r = t.edge === "bottom" ? "bottom" : "top", i = e.getViewportElement() ?? document.body, a = i === n, o = document.createElement("div");
	o.setAttribute(ve, r), t.className && (o.className = t.className);
	let s = () => $(e, o, a, r, t);
	s(), n.appendChild(o), new MutationObserver(s).observe(n, {
		attributes: !0,
		attributeFilter: ["class"]
	}), e.on("ready", s);
	let c = () => o.style.setProperty(ye, `${i.clientHeight}px`);
	return c(), new ResizeObserver(c).observe(i), o;
}, Se = {
	demoOption: "default value",
	cssautoload: !0,
	csspath: "",
	debug: !1
}, Ce = class e {
	deck;
	options;
	currentSlide = null;
	constructor(e, t) {
		this.deck = e, this.options = t, v.log("Demo plugin initialized with options:", t);
	}
	initialize() {
		v.log("Demo plugin initialized successfully");
		let e = document.createElement("div");
		e.className = "demo-plugin-indicator", e.textContent = "Demo Plugin Active", xe(this.deck, {
			edge: "bottom",
			className: "demo-plugin-anchor",
			zIndex: 1e3
		})?.appendChild(e), v.log("Indicator element added"), _e(this.deck), se(this.deck), ce(this.deck), pe(this.deck).then((e) => {
			v.log("Theme colors:", e);
		}), this.deck.on("slidechanged-h", (e) => {
			let t = e;
			if (t.currentSlide !== this.currentSlide) {
				v.log("Moved horizontally", t);
				let e = de(t.currentSlide);
				v.log("Slide type:", e), this.currentSlide = t.currentSlide;
			}
		}), this.deck.on("slidechanged-v", (e) => {
			let t = e;
			t.currentSlide !== this.currentSlide && (v.log("Moved vertically", t), this.currentSlide = t.currentSlide);
		}), this.deck.on("scrollmode-enter", (e) => {
			let t = e;
			v.log("Scroll mode enter", t);
		}), this.deck.on("scrollmode-exit", (e) => {
			let t = e;
			v.log("Scroll mode exit", t);
		});
	}
	static create(t, n) {
		let r = new e(t, n);
		return r.initialize(), r;
	}
}, we = async (e, t, n) => {
	v.initialize(n.debug, "demo-plugin"), v.group("Starting up");
	try {
		let r = e.getEnvironmentInfo();
		v.log("Environment:", r), await oe(e, n), await Ce.create(t, n);
	} finally {
		v.groupEnd();
	}
}, Te = () => new ne("demo-plugin", we, Se).createInterface();
export { Te as default };
