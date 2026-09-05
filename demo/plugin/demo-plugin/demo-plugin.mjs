//#region \0rolldown/runtime.js
var e = Object.create, t = Object.defineProperty, n = Object.getOwnPropertyDescriptor, r = Object.getOwnPropertyNames, i = Object.getPrototypeOf, a = Object.prototype.hasOwnProperty, o = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), s = (e, i, o, s) => {
	if (i && typeof i == "object" || typeof i == "function") for (var c = r(i), l = 0, u = c.length, d; l < u; l++) d = c[l], !a.call(e, d) && d !== o && t(e, d, {
		get: ((e) => i[e]).bind(null, d),
		enumerable: !(s = n(i, d)) || s.enumerable
	});
	return e;
}, c = (n, r, o) => (o = n == null ? {} : e(i(n)), s(r || !n || !n.__esModule || !a.call(n, "default") ? t(o, "default", {
	value: n,
	enumerable: !0
}) : o, n)), l = /* @__PURE__ */ o(((e, t) => {
	var n = function(e) {
		return r(e) && !i(e);
	};
	function r(e) {
		return !!e && typeof e == "object";
	}
	function i(e) {
		var t = Object.prototype.toString.call(e);
		return t === "[object RegExp]" || t === "[object Date]" || o(e);
	}
	var a = typeof Symbol == "function" && Symbol.for ? Symbol.for("react.element") : 60103;
	function o(e) {
		return e.$$typeof === a;
	}
	function s(e) {
		return Array.isArray(e) ? [] : {};
	}
	function c(e, t) {
		return t.clone !== !1 && t.isMergeableObject(e) ? g(s(e), e, t) : e;
	}
	function l(e, t, n) {
		return e.concat(t).map(function(e) {
			return c(e, n);
		});
	}
	function u(e, t) {
		if (!t.customMerge) return g;
		var n = t.customMerge(e);
		return typeof n == "function" ? n : g;
	}
	function d(e) {
		return Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(e).filter(function(t) {
			return Object.propertyIsEnumerable.call(e, t);
		}) : [];
	}
	function f(e) {
		return Object.keys(e).concat(d(e));
	}
	function p(e, t) {
		try {
			return t in e;
		} catch {
			return !1;
		}
	}
	function m(e, t) {
		return p(e, t) && !(Object.hasOwnProperty.call(e, t) && Object.propertyIsEnumerable.call(e, t));
	}
	function h(e, t, n) {
		var r = {};
		return n.isMergeableObject(e) && f(e).forEach(function(t) {
			r[t] = c(e[t], n);
		}), f(t).forEach(function(i) {
			m(e, i) || (r[i] = p(e, i) && n.isMergeableObject(t[i]) ? u(i, n)(e[i], t[i], n) : c(t[i], n));
		}), r;
	}
	function g(e, t, r) {
		r ||= {}, r.arrayMerge = r.arrayMerge || l, r.isMergeableObject = r.isMergeableObject || n, r.cloneUnlessOtherwiseSpecified = c;
		var i = Array.isArray(t);
		return i === Array.isArray(e) ? i ? r.arrayMerge(e, t, r) : h(e, t, r) : c(t, r);
	}
	g.all = function(e, t) {
		if (!Array.isArray(e)) throw Error("first argument should be an array");
		return e.reduce(function(e, n) {
			return g(e, n, t);
		}, {});
	}, t.exports = g;
})), u = [
	".js",
	".min.js",
	".mjs"
], d = (() => {
	let e = import.meta;
	if (typeof e?.url == "string" && e.url !== "") return e.url;
	let t = typeof document < "u" ? document.currentScript : null;
	return t && "src" in t && t.src ? t.src : "";
})(), f = (e) => {
	let t = e.lastIndexOf("/");
	return t === -1 ? "" : e.slice(0, t + 1);
}, p = (e) => {
	let t = e.split(/[?#]/)[0];
	return t.slice(t.lastIndexOf("/") + 1);
}, m = (e, t) => u.some((n) => e === `${t}${n}`), h = [
	/\/@fs\//,
	/\/@id\//,
	/\/\.vite\/deps\//,
	/[?&][vt]=/
], g = (e) => h.some((t) => t.test(e)), _ = (e) => {
	if (typeof document < "u") {
		let t = u.map((t) => `script[src$="${e}${t}"]`).join(", "), n = document.querySelector(t)?.getAttribute("src");
		if (n) return { directory: f(n) };
	}
	return d && !g(d) && m(p(d), e) ? { directory: f(d) } : { directory: null };
}, v = (e) => _(e).directory !== null, y = /* @__PURE__ */ new Map(), b = (e = "") => {
	let t = y.get(e);
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
	let l = e !== "" && v(e), u = {
		hasResolvableSource: l,
		hasWindow: n,
		hasDocument: r,
		isBundled: !l,
		isDevelopment: s || c,
		hasHMR: s,
		isViteDev: c
	};
	return y.set(e, u), u;
}, ee = /* @__PURE__ */ c(l()), x = class {
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
		let t = this.defaultConfig, n = e.getConfig()[this.pluginId] || {};
		this.userConfigData = n, this.mergedConfig = (0, ee.default)(t, n, {
			arrayMerge: (e, t) => t,
			clone: !0
		});
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
	getEnvironmentInfo = () => b(this.pluginId);
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
}, S = "data-css-id", C = (e, t) => new Promise((n, r) => {
	let i = document.createElement("link");
	i.rel = "stylesheet", i.href = t, i.setAttribute(S, e);
	let a = setTimeout(() => {
		i.parentNode && i.parentNode.removeChild(i), r(/* @__PURE__ */ Error(`[${e}] Timeout loading CSS from: ${t}`));
	}, 5e3);
	i.onload = () => {
		clearTimeout(a), n();
	}, i.onerror = () => {
		clearTimeout(a), i.parentNode && i.parentNode.removeChild(i), r(/* @__PURE__ */ Error(`[${e}] Failed to load CSS from: ${t}`));
	}, document.head.appendChild(i);
}), w = (e) => document.querySelectorAll(`[${S}="${e}"]`).length > 0, T = 1e4, E = (e) => new Promise((t) => {
	if (D(e)) return t(!0);
	if (typeof MutationObserver > "u") return t(!1);
	let n = !1, r = (e) => {
		n || (n = !0, i.disconnect(), clearTimeout(o), window.removeEventListener("load", a), t(e));
	}, i = new MutationObserver(() => {
		D(e) && r(!0);
	});
	i.observe(document.documentElement, {
		childList: !0,
		subtree: !0,
		attributeFilter: ["href", "rel"]
	});
	let a = () => requestAnimationFrame(() => r(D(e)));
	document.readyState === "complete" ? a() : window.addEventListener("load", a, { once: !0 });
	let o = setTimeout(() => r(D(e)), T);
}), D = (e) => {
	if (w(e)) return !0;
	try {
		return window.getComputedStyle(document.documentElement).getPropertyValue(`--cssimported-${e}`).trim() !== "";
	} catch {
		return !1;
	}
}, O = "--r-main-color", k = () => {
	if (typeof document > "u" || typeof window > "u") return !1;
	try {
		return getComputedStyle(document.documentElement).getPropertyValue(O).trim() !== "";
	} catch {
		return !1;
	}
}, A = (e = 1e3) => k() ? Promise.resolve(!0) : new Promise((t) => {
	let n = Date.now() + e, r = () => {
		if (k()) {
			t(!0);
			return;
		}
		if (Date.now() >= n) {
			t(!1);
			return;
		}
		setTimeout(r, 16);
	};
	r();
}), j = ((e) => new Proxy(e, { get: (e, t) => {
	if (t in e) return e[t];
	let n = t.toString();
	if (typeof console[n] == "function") return (...t) => {
		e.debugLog(n, ...t);
	};
} }))(new class {
	debugMode = !1;
	label = "DEBUG";
	groupDepth = 0;
	initialize(e, t = "DEBUG") {
		this.debugMode = e, this.label = t;
	}
	group = (...e) => {
		this.debugLog("group", ...e), this.groupDepth++;
	};
	groupCollapsed = (...e) => {
		this.debugLog("groupCollapsed", ...e), this.groupDepth++;
	};
	groupEnd = () => {
		this.groupDepth > 0 && (this.groupDepth--, this.debugLog("groupEnd"));
	};
	error = (...e) => {
		let t = this.debugMode;
		this.debugMode = !0, this.formatAndLog(console.error, e), this.debugMode = t;
	};
	table = (e, t, n) => {
		if (this.debugMode) try {
			typeof e == "string" && t !== void 0 && typeof t != "string" ? (this.groupDepth === 0 ? console.log(`[${this.label}]: ${e}`) : console.log(e), n ? console.table(t, n) : console.table(t)) : (this.groupDepth === 0 && console.log(`[${this.label}]: Table data`), typeof t == "object" && Array.isArray(t) ? console.table(e, t) : console.table(e));
		} catch (t) {
			console.error(`[${this.label}]: Error showing table:`, t), console.log(`[${this.label}]: Raw data:`, e);
		}
	};
	formatAndLog = (e, t) => {
		if (this.debugMode) try {
			this.groupDepth > 0 ? e.call(console, ...t) : t.length > 0 && typeof t[0] == "string" ? e.call(console, `[${this.label}]: ${t[0]}`, ...t.slice(1)) : e.call(console, `[${this.label}]:`, ...t);
		} catch (e) {
			console.error(`[${this.label}]: Error in logging:`, e), console.log(`[${this.label}]: Original log data:`, ...t);
		}
	};
	debugLog(e, ...t) {
		let n = console[e];
		if (!this.debugMode && e !== "error" || typeof n != "function") return;
		let r = n;
		if (e === "group" || e === "groupCollapsed") {
			t.length > 0 && typeof t[0] == "string" ? r.call(console, `[${this.label}]: ${t[0]}`, ...t.slice(1)) : r.call(console, `[${this.label}]:`, ...t);
			return;
		}
		if (e === "groupEnd") {
			r.call(console);
			return;
		}
		if (e === "table") {
			t.length === 1 ? this.table(t[0]) : t.length === 2 ? (t[0], this.table(t[0], t[1])) : t.length >= 3 && this.table(t[0], t[1], t[2]);
			return;
		}
		this.groupDepth > 0 ? r.call(console, ...t) : t.length > 0 && typeof t[0] == "string" ? r.call(console, `[${this.label}]: ${t[0]}`, ...t.slice(1)) : r.call(console, `[${this.label}]:`, ...t);
	}
}()), M = /* @__PURE__ */ new Set(), N = (e, t) => {
	let n = `${e}::${t}`;
	M.has(n) || (M.add(n), console.warn(`[${e}] ${t}`));
}, P = (e) => [`dist/plugin/${e}/${e}.css`, `plugin/${e}/${e}.css`], te = (e) => typeof e == "string" && e.trim() !== "", F = async (e, t) => {
	let { cssautoload: n, csspath: r, debug: i = !1 } = t;
	if (n === !1 || r === !1) return i && console.log(`[${e}] CSS loading is switched off`), { status: "skipped" };
	if (te(r)) {
		let t = r.trim(), n = D(e), a = n && !!document.querySelector(`[data-css-id="${e}"]`);
		try {
			return await C(e, t), i && console.log(`[${e}] CSS loaded from: ${t}`), n && N(e, `Loaded CSS from ${t}, but a stylesheet for this plugin was already on the page (${a ? "a tagged <link>" : "an import or inline <style>"}) — csspath adds one, it cannot remove one. Both are live and the cascade decides. Remove the other import or <link>, or drop csspath.`), {
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
	if (D(e)) return i && console.log(`[${e}] CSS is already imported, skipping`), { status: "present" };
	let { directory: a } = _(e);
	if (a !== null || n === !0) {
		let t = [...a === null ? [] : [`${a}${e}.css`], ...P(e)].filter((e, t, n) => n.indexOf(e) === t);
		for (let n of t) try {
			return await C(e, n), i && console.log(`[${e}] CSS loaded from: ${n}`), {
				status: "loaded",
				path: n
			};
		} catch {
			i && console.log(`[${e}] No CSS at: ${n}`);
		}
		return console.warn(`[${e}] Could not load CSS. Tried: ${t.join(", ")}. Import the stylesheet yourself, or set csspath to where it is.`), { status: "failed" };
	}
	return E(e).then((t) => {
		t || N(e, `CSS could not be autoloaded here, because the plugin is part of a bundle. Import it once in your own code: import 'reveal.js-${e}/${e}.css'`);
	}), { status: "advised" };
};
async function I(e, t) {
	if ("getEnvironmentInfo" in e && t) {
		let n = e, r = n.userConfig, i = "cssautoload" in r && r.cssautoload !== "auto" ? t.cssautoload : void 0;
		return F(n.pluginId, {
			...t,
			cssautoload: i
		});
	}
	let { id: n, cssautoload: r, csspath: i, debug: a } = e;
	return F(n, {
		cssautoload: r === "auto" ? void 0 : r,
		csspath: i,
		debug: a
	});
}
//#endregion
//#region ../src/utils/plugin-tools/event-tools.ts
var L = Symbol.for("reveal.js-plugintoolkit.directionEvents"), R = Symbol.for("reveal.js-plugintoolkit.scrollModeEvents"), z = (e, t, n) => {
	Object.defineProperty(e, t, {
		value: n,
		configurable: !0,
		enumerable: !1,
		writable: !1
	});
}, B = (e) => {
	if (e[L]) return;
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
	}), z(e, L, !0);
}, V = (e) => {
	if (e[R]) return () => {};
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
		i.disconnect(), delete e[R];
	};
	return z(e, R, a), a;
}, H = (e) => e instanceof HTMLElement && e.tagName === "SECTION", U = (e) => H(e) ? Array.from(e.children).some((e) => e instanceof HTMLElement && e.tagName === "SECTION") : !1, W = (e) => H(e) ? e.parentElement instanceof HTMLElement && e.parentElement.tagName === "SECTION" : !1, G = (e) => H(e) ? W(e) ? "vertical" : U(e) ? "stack" : "horizontal" : "invalid", K = Symbol.for("reveal.js-plugintoolkit.themeColor"), q = "has-light-background", J = "has-dark-background", Y = "--c-theme-color", X = "--c-theme-heading-color", Z = {
	text: "section",
	heading: "h1"
}, ne = "c-theme-inverted", re = (e, t, n) => {
	Object.defineProperty(e, t, {
		value: n,
		configurable: !0,
		enumerable: !1,
		writable: !1
	});
}, Q = (e) => {
	let t = e.getElementsByClassName("slides")[0];
	if (!t) return null;
	let n = document.createElement("section"), r = document.createElement(Z.heading);
	n.appendChild(r), t.appendChild(n);
	let i = () => ({
		text: getComputedStyle(n).getPropertyValue("color"),
		heading: getComputedStyle(r).getPropertyValue("color")
	}), a = i();
	n.classList.add(q);
	let o = i(), s = "dark";
	return o.text === a.text && o.heading === a.heading && (s = "light", n.classList.remove(q), n.classList.add(J), o = i()), n.remove(), {
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
}, $ = (e, t, n) => {
	let r = n.theme === "dark" ? e.classList.contains(q) : e.classList.contains(J), i = (e) => r ? e.inverse : e.regular;
	t.style.setProperty(Y, i(n.text)), t.style.setProperty(X, i(n.heading)), t.classList.toggle(ne, r);
}, ie = async (e, { timeout: t = 1e3 }) => {
	let n = e.getRevealElement();
	if (!n) return null;
	let r = e.getViewportElement() ?? n;
	await A(t);
	let i = Q(n);
	return i ? ($(n, r, i), new MutationObserver(() => $(n, r, i)).observe(n, {
		attributes: !0,
		attributeFilter: ["class"]
	}), i) : null;
}, ae = (e, t = {}) => {
	let n = e[K];
	if (n) return n;
	let r = ie(e, t);
	return re(e, K, r), r;
}, oe = {
	demoOption: "default value",
	cssautoload: !0,
	csspath: "",
	debug: !1
}, se = class e {
	deck;
	options;
	currentSlide = null;
	constructor(e, t) {
		this.deck = e, this.options = t, j.log("Demo plugin initialized with options:", t);
	}
	initialize() {
		j.log("Demo plugin initialized successfully");
		let e = document.createElement("div");
		e.className = "demo-plugin-indicator", e.textContent = "Demo Plugin Active", document.body.appendChild(e), j.log("Indicator element added"), B(this.deck), V(this.deck), ae(this.deck).then((e) => {
			j.log("Theme colors:", e);
		}), this.deck.on("slidechanged-h", (e) => {
			let t = e;
			if (t.currentSlide !== this.currentSlide) {
				j.log("Moved horizontally", t);
				let e = G(t.currentSlide);
				j.log("Slide type:", e), this.currentSlide = t.currentSlide;
			}
		}), this.deck.on("slidechanged-v", (e) => {
			let t = e;
			t.currentSlide !== this.currentSlide && (j.log("Moved vertically", t), this.currentSlide = t.currentSlide);
		}), this.deck.on("scrollmode-enter", (e) => {
			let t = e;
			j.log("Scroll mode enter", t);
		}), this.deck.on("scrollmode-exit", (e) => {
			let t = e;
			j.log("Scroll mode exit", t);
		});
	}
	static create(t, n) {
		let r = new e(t, n);
		return r.initialize(), r;
	}
}, ce = async (e, t, n) => {
	j.initialize(n.debug, "demo-plugin");
	let r = e.getEnvironmentInfo();
	j.log("Environment:", r), await I(e, n), await se.create(t, n);
}, le = () => new x("demo-plugin", ce, oe).createInterface();
//#endregion
export { le as default };
