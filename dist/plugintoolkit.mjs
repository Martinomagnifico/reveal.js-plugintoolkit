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
}, d = (e) => u(e).directory !== null, f = /* @__PURE__ */ new Map(), p = (e = "") => {
	let t = f.get(e);
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
	let l = e !== "" && d(e), u = {
		hasResolvableSource: l,
		hasWindow: n,
		hasDocument: r,
		isBundled: !l,
		isDevelopment: s || c,
		hasHMR: s,
		isViteDev: c
	};
	return f.set(e, u), u;
}, m = class {
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
	getEnvironmentInfo = () => p(this.pluginId);
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
}, h = "data-css-id", g = (e, t) => new Promise((n, r) => {
	let i = document.createElement("link");
	i.rel = "stylesheet", i.href = t, i.setAttribute(h, e);
	let a = setTimeout(() => {
		i.parentNode && i.parentNode.removeChild(i), r(/* @__PURE__ */ Error(`[${e}] Timeout loading CSS from: ${t}`));
	}, 5e3);
	i.onload = () => {
		clearTimeout(a), n();
	}, i.onerror = () => {
		clearTimeout(a), i.parentNode && i.parentNode.removeChild(i), r(/* @__PURE__ */ Error(`[${e}] Failed to load CSS from: ${t}`));
	}, document.head.appendChild(i);
}), ee = (e) => document.querySelectorAll(`[${h}="${e}"]`).length > 0, te = 1e4, ne = (e) => Promise.resolve(v(e)), _ = (e) => new Promise((t) => {
	if (v(e)) return t(!0);
	if (typeof MutationObserver > "u") return t(!1);
	let n = !1, r = (e) => {
		n || (n = !0, i.disconnect(), clearTimeout(o), window.removeEventListener("load", a), t(e));
	}, i = new MutationObserver(() => {
		v(e) && r(!0);
	});
	i.observe(document.documentElement, {
		childList: !0,
		subtree: !0,
		attributeFilter: ["href", "rel"]
	});
	let a = () => requestAnimationFrame(() => r(v(e)));
	document.readyState === "complete" ? a() : window.addEventListener("load", a, { once: !0 });
	let o = setTimeout(() => r(v(e)), te);
}), v = (e) => {
	if (ee(e)) return !0;
	try {
		return window.getComputedStyle(document.documentElement).getPropertyValue(`--cssimported-${e}`).trim() !== "";
	} catch {
		return !1;
	}
}, re = "--r-main-color", y = () => {
	if (typeof document > "u" || typeof window > "u") return !1;
	try {
		return getComputedStyle(document.documentElement).getPropertyValue(re).trim() !== "";
	} catch {
		return !1;
	}
}, b = (e = 1e3) => y() ? Promise.resolve(!0) : new Promise((t) => {
	let n = Date.now() + e, r = () => {
		if (y()) {
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
}), x = () => y(), ie = ((e) => new Proxy(e, { get: (e, t) => {
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
}()), S = /* @__PURE__ */ new Set(), C = (e, t) => {
	let n = `${e}::${t}`;
	S.has(n) || (S.add(n), console.warn(`[${e}] ${t}`));
}, w = (e) => [`dist/plugin/${e}/${e}.css`, `plugin/${e}/${e}.css`], T = (e) => typeof e == "string" && e.trim() !== "", E = async (e, t) => {
	let { cssautoload: n, csspath: r, debug: i = !1 } = t;
	if (n === !1 || r === !1) return i && console.log(`[${e}] CSS loading is switched off`), { status: "skipped" };
	if (T(r)) {
		let t = r.trim(), n = v(e), a = n && !!document.querySelector(`[data-css-id="${e}"]`);
		try {
			return await g(e, t), i && console.log(`[${e}] CSS loaded from: ${t}`), n && C(e, `Loaded CSS from ${t}, but a stylesheet for this plugin was already on the page (${a ? "a tagged <link>" : "an import or inline <style>"}) — csspath adds one, it cannot remove one. Both are live and the cascade decides. Remove the other import or <link>, or drop csspath.`), {
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
	if (v(e)) return i && console.log(`[${e}] CSS is already imported, skipping`), { status: "present" };
	let { directory: a } = u(e);
	if (a !== null || n === !0) {
		let t = [...a === null ? [] : [`${a}${e}.css`], ...w(e)].filter((e, t, n) => n.indexOf(e) === t);
		for (let n of t) try {
			return await g(e, n), i && console.log(`[${e}] CSS loaded from: ${n}`), {
				status: "loaded",
				path: n
			};
		} catch {
			i && console.log(`[${e}] No CSS at: ${n}`);
		}
		return console.warn(`[${e}] Could not load CSS. Tried: ${t.join(", ")}. Import the stylesheet yourself, or set csspath to where it is.`), { status: "failed" };
	}
	return _(e).then((t) => {
		t || C(e, `CSS could not be autoloaded here, because the plugin is part of a bundle. Import it once in your own code: import 'reveal.js-${e}/${e}.css'`);
	}), { status: "advised" };
};
async function D(e, t) {
	if ("getEnvironmentInfo" in e && t) {
		let n = e, r = n.userConfig, i = "cssautoload" in r && r.cssautoload !== "auto" ? t.cssautoload : void 0;
		return E(n.pluginId, {
			...t,
			cssautoload: i
		});
	}
	let { id: n, cssautoload: r, csspath: i, debug: a } = e;
	return E(n, {
		cssautoload: r === "auto" ? void 0 : r,
		csspath: i,
		debug: a
	});
}
//#endregion
//#region src/utils/plugin-tools/event-tools.ts
var O = /* @__PURE__ */ n({
	addDirectionEvents: () => M,
	addMoreDirectionEvents: () => N,
	addScrollModeEvents: () => P
}), k = Symbol.for("reveal.js-plugintoolkit.directionEvents"), A = Symbol.for("reveal.js-plugintoolkit.scrollModeEvents"), j = (e, t, n) => {
	Object.defineProperty(e, t, {
		value: n,
		configurable: !0,
		enumerable: !1,
		writable: !1
	});
}, M = (e) => {
	if (e[k]) return;
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
	}), j(e, k, !0);
}, N = M, P = (e) => {
	if (e[A]) return () => {};
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
		i.disconnect(), delete e[A];
	};
	return j(e, A, a), a;
}, ae = /* @__PURE__ */ n({
	SectionType: () => oe,
	getSectionType: () => B,
	getStack: () => z,
	isHorizontal: () => R,
	isSection: () => F,
	isStack: () => I,
	isVertical: () => L
}), oe = /* @__PURE__ */ function(e) {
	return e.HORIZONTAL = "horizontal", e.STACK = "stack", e.VERTICAL = "vertical", e.INVALID = "invalid", e;
}({}), F = (e) => e instanceof HTMLElement && e.tagName === "SECTION", I = (e) => F(e) ? Array.from(e.children).some((e) => e instanceof HTMLElement && e.tagName === "SECTION") : !1, L = (e) => F(e) ? e.parentElement instanceof HTMLElement && e.parentElement.tagName === "SECTION" : !1, R = (e) => F(e) && !L(e) && !I(e), z = (e) => {
	if (!F(e)) return null;
	if (L(e)) {
		let t = e.parentElement;
		if (t instanceof HTMLElement && I(t)) return t;
	}
	return null;
}, B = (e) => F(e) ? L(e) ? "vertical" : I(e) ? "stack" : "horizontal" : "invalid", V = /* @__PURE__ */ n({
	isJSON: () => H,
	toJSONString: () => U
}), H = (e) => {
	try {
		return JSON.parse(e) && !!e;
	} catch {
		return !1;
	}
}, U = (e) => {
	if (e == null) return "";
	let t = e;
	if (typeof t == "string" && (t = t.replace(/[“”]/g, "\"").replace(/[‘’]/g, "'")), H(e)) return e;
	if (typeof e == "object") return JSON.stringify(e, null, 2);
	if (typeof e == "string") {
		let t = e.trim().replace(/'/g, "\"");
		return t.charAt(0) === "{" ? t : `{${t}}`;
	}
	return "";
}, W = /* @__PURE__ */ n({
	copyDataAttributes: () => G,
	createNode: () => K
}), G = (e, t, n) => {
	for (let r of Array.from(e.attributes)) r.nodeName.startsWith("data") && (!n || r.nodeName !== n) && t.setAttribute(r.nodeName, r.nodeValue || "");
}, K = (e) => document.createRange().createContextualFragment(e).firstElementChild, se = /* @__PURE__ */ n({ sanitizeText: () => q }), q = (e) => e.toLowerCase().replace(/\s+/g, "").replace(/[^\p{L}\p{N}-]/gu, ""), ce = /* @__PURE__ */ n({ addThemeColor: () => $ }), J = Symbol.for("reveal.js-plugintoolkit.themeColor"), Y = "has-light-background", X = "has-dark-background", le = "--c-theme-color", ue = "--c-theme-heading-color", de = {
	text: "section",
	heading: "h1"
}, fe = "c-theme-inverted", Z = (e, t, n) => {
	Object.defineProperty(e, t, {
		value: n,
		configurable: !0,
		enumerable: !1,
		writable: !1
	});
}, pe = (e) => {
	let t = e.getElementsByClassName("slides")[0];
	if (!t) return null;
	let n = document.createElement("section"), r = document.createElement(de.heading);
	n.appendChild(r), t.appendChild(n);
	let i = () => ({
		text: getComputedStyle(n).getPropertyValue("color"),
		heading: getComputedStyle(r).getPropertyValue("color")
	}), a = i();
	n.classList.add(Y);
	let o = i(), s = "dark";
	return o.text === a.text && o.heading === a.heading && (s = "light", n.classList.remove(Y), n.classList.add(X), o = i()), n.remove(), {
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
}, Q = (e, t, n) => {
	let r = n.theme === "dark" ? e.classList.contains(Y) : e.classList.contains(X), i = (e) => r ? e.inverse : e.regular;
	t.style.setProperty(le, i(n.text)), t.style.setProperty(ue, i(n.heading)), t.classList.toggle(fe, r);
}, me = async (e, { timeout: t = 1e3 }) => {
	let n = e.getRevealElement();
	if (!n) return null;
	let r = e.getViewportElement() ?? n;
	await b(t);
	let i = pe(n);
	return i ? (Q(n, r, i), new MutationObserver(() => Q(n, r, i)).observe(n, {
		attributes: !0,
		attributeFilter: ["class"]
	}), i) : null;
}, $ = (e, t = {}) => {
	let n = e[J];
	if (n) return n;
	let r = me(e, t);
	return Z(e, J, r), r;
}, he = /* @__PURE__ */ n({
	addDirectionEvents: () => M,
	addMoreDirectionEvents: () => N,
	addScrollModeEvents: () => P,
	addThemeColor: () => $,
	copyDataAttributes: () => G,
	createNode: () => K,
	getSectionType: () => B,
	getStack: () => z,
	isHorizontal: () => R,
	isJSON: () => H,
	isSection: () => F,
	isStack: () => I,
	isVertical: () => L,
	sanitizeText: () => q,
	toJSONString: () => U
});
//#endregion
export { m as PluginBase, v as checkCssImported, V as configTools, W as domTools, O as eventTools, u as findPluginSource, d as hasResolvableSource, ne as isCssImported, x as isThemeApplied, D as pluginCSS, ie as pluginDebug, he as pluginTools, ae as sectionTools, se as textTools, ce as themeTools, C as warnOnce, _ as whenCssImported, b as whenThemeApplied };
