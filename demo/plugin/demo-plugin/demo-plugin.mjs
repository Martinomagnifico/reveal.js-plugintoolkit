//#region \0rolldown/runtime.js
var e = Object.create, t = Object.defineProperty, n = Object.getOwnPropertyDescriptor, r = Object.getOwnPropertyNames, i = Object.getPrototypeOf, a = Object.prototype.hasOwnProperty, o = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), s = (e, i, o, s) => {
	if (i && typeof i == "object" || typeof i == "function") for (var c = r(i), l = 0, u = c.length, d; l < u; l++) d = c[l], !a.call(e, d) && d !== o && t(e, d, {
		get: ((e) => i[e]).bind(null, d),
		enumerable: !(s = n(i, d)) || s.enumerable
	});
	return e;
}, c = /* @__PURE__ */ ((n, r, o) => (o = n == null ? {} : e(i(n)), s(r || !n || !n.__esModule || !a.call(n, "default") ? t(o, "default", {
	value: n,
	enumerable: !0
}) : o, n)))((/* @__PURE__ */ o(((e, t) => {
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
})))()), l = [
	".js",
	".min.js",
	".mjs"
], u = (() => {
	let e = import.meta;
	if (typeof e?.url == "string" && e.url !== "") return e.url;
	let t = typeof document < "u" ? document.currentScript : null;
	return t && "src" in t && t.src ? t.src : "";
})(), d = (e) => {
	let t = e.lastIndexOf("/");
	return t === -1 ? "" : e.slice(0, t + 1);
}, f = (e) => {
	let t = e.split(/[?#]/)[0];
	return t.slice(t.lastIndexOf("/") + 1);
}, p = (e, t) => l.some((n) => e === `${t}${n}`), m = [
	/\/@fs\//,
	/\/@id\//,
	/\/\.vite\/deps\//,
	/[?&][vt]=/
], h = (e) => m.some((t) => t.test(e)), g = (e) => {
	if (typeof document < "u") {
		let t = l.map((t) => `script[src$="${e}${t}"]`).join(", "), n = document.querySelector(t)?.getAttribute("src");
		if (n) return {
			directory: d(n),
			isBundled: !1
		};
	}
	return u && !h(u) && p(f(u), e) ? {
		directory: d(u),
		isBundled: !1
	} : {
		directory: "",
		isBundled: !0
	};
}, _ = (e) => g(e).isBundled, v = (e) => {
	let { directory: t } = g(e);
	return t || `dist/plugin/${e}/`;
}, y = /* @__PURE__ */ new Map(), b = (e = "") => {
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
	let l = s || c, u = e !== "" && _(e), d = {
		isDevelopment: l,
		hasHMR: s,
		isViteDev: c,
		isBundled: u,
		hasWindow: n,
		hasDocument: r
	};
	return y.set(e, d), d;
}, x = class {
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
		this.userConfigData = n, this.mergedConfig = (0, c.default)(t, n, {
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
}), w = (e) => document.querySelectorAll(`[${S}="${e}"]`).length > 0, T = 1e4, E = (e) => Promise.resolve(O(e)), D = (e) => new Promise((t) => {
	if (O(e)) return t(!0);
	if (typeof MutationObserver > "u") return t(!1);
	let n = !1, r = (e) => {
		n || (n = !0, i.disconnect(), clearTimeout(o), window.removeEventListener("load", a), t(e));
	}, i = new MutationObserver(() => {
		O(e) && r(!0);
	});
	i.observe(document.documentElement, {
		childList: !0,
		subtree: !0,
		attributeFilter: ["href", "rel"]
	});
	let a = () => requestAnimationFrame(() => r(O(e)));
	document.readyState === "complete" ? a() : window.addEventListener("load", a, { once: !0 });
	let o = setTimeout(() => r(O(e)), T);
}), O = (e) => {
	if (w(e)) return !0;
	try {
		return window.getComputedStyle(document.documentElement).getPropertyValue(`--cssimported-${e}`).trim() !== "";
	} catch {
		return !1;
	}
}, k = async (e) => {
	let { id: t, cssautoload: n = !0, csspath: r = "", debug: i = !1 } = e;
	if (n === !1 || r === !1) return;
	if (w(t) && (typeof r != "string" || r.trim() === "")) {
		i && console.log(`[${t}] CSS is already loaded, skipping`);
		return;
	}
	w(t) && typeof r == "string" && r.trim() !== "" && i && console.log(`[${t}] CSS is already loaded, also loading user-specified path: ${r}`);
	let a = [];
	typeof r == "string" && r.trim() !== "" && a.push(r);
	let o = v(t);
	if (o) {
		let e = `${o}${t}.css`;
		a.push(e);
	}
	let s = `dist/plugin/${t}/${t}.css`, c = `plugin/${t}/${t}.css`;
	a.push(s), a.push(c);
	for (let e of a) try {
		await C(t, e);
		let n = "CSS";
		r && e === r ? n = "user-specified CSS" : o && e === `${o}${t}.css` ? n = "CSS (auto-detected from script location)" : e === s ? n = "CSS (standard fallback v5)" : e === c && (n = "CSS (standard fallback v4)"), i && console.log(`[${t}] ${n} loaded successfully from: ${e}`);
		return;
	} catch {
		i && console.log(`[${t}] Failed to load CSS from: ${e}`);
	}
	typeof r == "string" && r.trim() !== "" ? console.warn(`[${t}] Could not load CSS from: ${r}`) : i && console.log(`[${t}] Could not autoload CSS from any location`);
};
async function A(e, t) {
	if ("getEnvironmentInfo" in e && t) {
		let n = e, r = n.getEnvironmentInfo(), i = "cssautoload" in n.userConfig, a = i ? !!t.cssautoload : !r.isBundled;
		if (await E(n.pluginId) && (typeof t.csspath != "string" || t.csspath.trim() === "")) {
			t.debug && console.log(`[${n.pluginId}] CSS is already imported, skipping`);
			return;
		}
		if (a) return k({
			id: n.pluginId,
			cssautoload: !0,
			csspath: t.csspath,
			debug: t.debug
		});
		!i && r.isBundled && D(n.pluginId).then((e) => {
			e || console.warn(`[${n.pluginId}] CSS autoloading is disabled in bundler environments. Please import the CSS manually, using import.`);
		});
		return;
	}
	return k(e);
}
var j = ((e) => new Proxy(e, { get: (e, t) => {
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
}()), M = (e) => {
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
	});
}, N = (e) => {
	let t = e.getViewportElement();
	if (!t) return console.warn("[verticator]: Could not find viewport element"), () => {};
	let n = () => t.classList.contains("reveal-scroll"), r = n(), i = !0, a = new MutationObserver(() => {
		if (!i) return;
		let t = n();
		if (t !== r) {
			let n = e.getCurrentSlide(), i = e.getIndices(), a = i.h, o = i.v, s = t ? "scrollmode-enter" : "scrollmode-exit";
			e.dispatchEvent({
				type: s,
				data: {
					currentSlide: n,
					previousSlide: null,
					indexh: a,
					indexv: o
				}
			}), r = t;
		}
	});
	return a.observe(t, {
		attributes: !0,
		attributeFilter: ["class"]
	}), () => {
		i = !1, a.disconnect();
	};
}, P = (e) => e instanceof HTMLElement && e.tagName === "SECTION", F = (e) => P(e) ? Array.from(e.children).some((e) => e instanceof HTMLElement && e.tagName === "SECTION") : !1, I = (e) => P(e) ? e.parentElement instanceof HTMLElement && e.parentElement.tagName === "SECTION" : !1, L = (e) => P(e) ? I(e) ? "vertical" : F(e) ? "stack" : "horizontal" : "invalid", R = {
	demoOption: "default value",
	cssautoload: !0,
	csspath: "",
	debug: !1
}, z = class e {
	deck;
	options;
	currentSlide = null;
	constructor(e, t) {
		this.deck = e, this.options = t, j.log("Demo plugin initialized with options:", t);
	}
	initialize() {
		j.log("Demo plugin initialized successfully");
		let e = document.createElement("div");
		e.className = "demo-plugin-indicator", e.textContent = "Demo Plugin Active", document.body.appendChild(e), j.log("Indicator element added"), M(this.deck), N(this.deck), this.deck.on("slidechanged-h", (e) => {
			let t = e;
			if (t.currentSlide !== this.currentSlide) {
				j.log("Moved horizontally", t);
				let e = L(t.currentSlide);
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
}, B = async (e, t, n) => {
	j.initialize(n.debug, "demo-plugin");
	let r = e.getEnvironmentInfo();
	j.log("Environment:", r), await A(e, n), await z.create(t, n);
}, V = () => new x("demo-plugin", B, R).createInterface();
//#endregion
export { V as default };
