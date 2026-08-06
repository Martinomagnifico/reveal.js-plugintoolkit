import e from "deepmerge";
//#region \0rolldown/runtime.js
var t = Object.defineProperty, n = (e, n) => {
	let r = {};
	for (var i in e) t(r, i, {
		get: e[i],
		enumerable: !0
	});
	return n || t(r, Symbol.toStringTag, { value: "Module" }), r;
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
}, s = (e, t) => r.some((n) => e === `${t}${n}`), c = (e) => {
	if (typeof document < "u") {
		let t = r.map((t) => `script[src$="${e}${t}"]`).join(", "), n = document.querySelector(t)?.getAttribute("src");
		if (n) return {
			directory: a(n),
			isBundled: !1
		};
	}
	return i && s(o(i), e) ? {
		directory: a(i),
		isBundled: !1
	} : {
		directory: "",
		isBundled: !0
	};
}, l = (e) => c(e).isBundled, u = (e) => {
	let { directory: t } = c(e);
	return t || `dist/plugin/${e}/`;
}, d = /* @__PURE__ */ new Map(), f = (e = "") => {
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
	let u = s || c, f = e !== "" && l(e), p = {
		isDevelopment: u,
		hasHMR: s,
		isViteDev: c,
		isBundled: f,
		hasWindow: n,
		hasDocument: r
	};
	return d.set(e, p), p;
}, p = class {
	defaultConfig;
	pluginInit;
	pluginId;
	mergedConfig = null;
	userConfigData = null;
	data = {};
	constructor(e, t, n) {
		typeof e == "string" ? (this.pluginId = e, this.pluginInit = t, this.defaultConfig = n || {}) : (this.pluginId = e.id, this.pluginInit = e.init, this.defaultConfig = e.defaultConfig || {});
	}
	initializeConfig(t) {
		let n = this.defaultConfig, r = t.getConfig()[this.pluginId] || {};
		this.userConfigData = r, this.mergedConfig = e(n, r, {
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
	getEnvironmentInfo = () => f(this.pluginId);
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
}, m = "data-css-id", h = (e, t) => new Promise((n, r) => {
	let i = document.createElement("link");
	i.rel = "stylesheet", i.href = t, i.setAttribute(m, e);
	let a = setTimeout(() => {
		i.parentNode && i.parentNode.removeChild(i), r(/* @__PURE__ */ Error(`[${e}] Timeout loading CSS from: ${t}`));
	}, 5e3);
	i.onload = () => {
		clearTimeout(a), n();
	}, i.onerror = () => {
		clearTimeout(a), i.parentNode && i.parentNode.removeChild(i), r(/* @__PURE__ */ Error(`[${e}] Failed to load CSS from: ${t}`));
	}, document.head.appendChild(i);
}), g = (e) => document.querySelectorAll(`[${m}="${e}"]`).length > 0, _ = (e) => new Promise((t) => {
	if (n()) return t(!0);
	setTimeout(() => {
		t(n());
	}, 50);
	function n() {
		if (g(e)) return !0;
		try {
			return window.getComputedStyle(document.documentElement).getPropertyValue(`--cssimported-${e}`).trim() !== "";
		} catch {
			return !1;
		}
	}
}), v = async (e) => {
	let { id: t, cssautoload: n = !0, csspath: r = "", debug: i = !1 } = e;
	if (n === !1 || r === !1) return;
	if (g(t) && !(typeof r == "string" && r.trim() !== "")) {
		i && console.log(`[${t}] CSS is already loaded, skipping`);
		return;
	}
	g(t) && typeof r == "string" && r.trim() !== "" && i && console.log(`[${t}] CSS is already loaded, also loading user-specified path: ${r}`);
	let a = [];
	typeof r == "string" && r.trim() !== "" && a.push(r);
	let o = u(t);
	if (o) {
		let e = `${o}${t}.css`;
		a.push(e);
	}
	let s = `dist/plugin/${t}/${t}.css`, c = `plugin/${t}/${t}.css`;
	a.push(s), a.push(c);
	for (let e of a) try {
		await h(t, e);
		let n = "CSS";
		r && e === r ? n = "user-specified CSS" : o && e === `${o}${t}.css` ? n = "CSS (auto-detected from script location)" : e === s ? n = "CSS (standard fallback v5)" : e === c && (n = "CSS (standard fallback v4)"), i && console.log(`[${t}] ${n} loaded successfully from: ${e}`);
		return;
	} catch {
		i && console.log(`[${t}] Failed to load CSS from: ${e}`);
	}
	console.warn(`[${t}] Could not load CSS from any location`);
};
async function y(e, t) {
	if ("getEnvironmentInfo" in e && t) {
		let n = e, r = n.getEnvironmentInfo();
		if (await _(n.pluginId) && !(typeof t.csspath == "string" && t.csspath.trim() !== "")) {
			t.debug && console.log(`[${n.pluginId}] CSS is already imported, skipping`);
			return;
		}
		let i = "cssautoload" in n.userConfig;
		if (i ? t.cssautoload : !r.isBundled) return v({
			id: n.pluginId,
			cssautoload: !0,
			csspath: t.csspath,
			debug: t.debug
		});
		!i && r.isBundled && console.warn(`[${n.pluginId}] CSS autoloading is disabled in bundler environments. Please import the CSS manually, using import.`);
		return;
	}
	return v(e);
}
var b = ((e) => new Proxy(e, { get: (e, t) => {
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
}()), x = /* @__PURE__ */ n({
	addDirectionEvents: () => S,
	addMoreDirectionEvents: () => C,
	addScrollModeEvents: () => w
}), S = (e) => {
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
}, C = S, w = (e) => {
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
}, T = /* @__PURE__ */ n({
	SectionType: () => E,
	getSectionType: () => M,
	getStack: () => j,
	isHorizontal: () => A,
	isSection: () => D,
	isStack: () => O,
	isVertical: () => k
}), E = /* @__PURE__ */ function(e) {
	return e.HORIZONTAL = "horizontal", e.STACK = "stack", e.VERTICAL = "vertical", e.INVALID = "invalid", e;
}({}), D = (e) => e instanceof HTMLElement && e.tagName === "SECTION", O = (e) => D(e) ? Array.from(e.children).some((e) => e instanceof HTMLElement && e.tagName === "SECTION") : !1, k = (e) => D(e) ? e.parentElement instanceof HTMLElement && e.parentElement.tagName === "SECTION" : !1, A = (e) => D(e) && !k(e) && !O(e), j = (e) => {
	if (!D(e)) return null;
	if (k(e)) {
		let t = e.parentElement;
		if (t instanceof HTMLElement && O(t)) return t;
	}
	return null;
}, M = (e) => D(e) ? k(e) ? "vertical" : O(e) ? "stack" : "horizontal" : "invalid", N = /* @__PURE__ */ n({
	addDirectionEvents: () => S,
	addMoreDirectionEvents: () => C,
	addScrollModeEvents: () => w,
	getSectionType: () => M,
	getStack: () => j,
	isHorizontal: () => A,
	isSection: () => D,
	isStack: () => O,
	isVertical: () => k
});
//#endregion
export { p as PluginBase, x as eventTools, _ as isCssImported, y as pluginCSS, b as pluginDebug, N as pluginTools, T as sectionTools };
