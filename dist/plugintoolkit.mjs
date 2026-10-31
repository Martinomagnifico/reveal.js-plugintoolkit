// \0rolldown/runtime.js
var e = Object.defineProperty, t = (t, n) => {
	let r = {};
	for (var i in t) e(r, i, {
		get: t[i],
		enumerable: !0
	});
	return n || e(r, Symbol.toStringTag, { value: "Module" }), r;
}, n = /* @__PURE__ */ t({
	isJSON: () => r,
	mergeDeep: () => s,
	toJSONString: () => i
}), r = (e) => {
	try {
		return JSON.parse(e) && !!e;
	} catch {
		return !1;
	}
}, i = (e) => {
	if (e == null) return "";
	if (r(e)) return e;
	if (typeof e == "object") return JSON.stringify(e, null, 2);
	if (typeof e == "string") {
		let t = e.replace(/[“”]/g, "\"").replace(/[‘’]/g, "'");
		if (r(t)) return t;
		let n = t.trim().replace(/'/g, "\"");
		return n.charAt(0) === "{" ? n : `{${n}}`;
	}
	return "";
}, a = (e) => {
	if (typeof e != "object" || !e) return !1;
	let t = Object.getPrototypeOf(e);
	return t === Object.prototype || t === null;
}, o = /* @__PURE__ */ new Set([
	"__proto__",
	"constructor",
	"prototype"
]), s = (...e) => {
	let t = {};
	for (let n of e) if (a(n)) for (let e of Object.keys(n)) {
		if (o.has(e)) continue;
		let r = n[e];
		t[e] = a(r) ? s(t[e], r) : r;
	}
	return t;
}, c = [
	".js",
	".min.js",
	".mjs"
], l = (() => {
	let e = import.meta;
	if (typeof e?.url == "string" && e.url !== "") return e.url;
	let t = typeof document < "u" ? document.currentScript : null;
	return t && "src" in t && t.src ? t.src : "";
})(), u = (e) => {
	let t = e.lastIndexOf("/");
	return t === -1 ? "" : e.slice(0, t + 1);
}, ee = (e) => {
	let t = e.split(/[?#]/)[0];
	return t.slice(t.lastIndexOf("/") + 1);
}, te = (e, t) => c.some((n) => e === `${t}${n}`), ne = [
	/\/@fs\//,
	/\/@id\//,
	/\/\.vite\/deps\//,
	/[?&][vt]=/
], re = (e) => ne.some((t) => t.test(e)), d = (e) => {
	if (typeof document < "u") {
		let t = c.map((t) => `script[src$="${e}${t}"]`).join(", "), n = document.querySelector(t)?.getAttribute("src");
		if (n) return { directory: u(n) };
	}
	return l && !re(l) && te(ee(l), e) ? { directory: u(l) } : { directory: null };
}, ie = (e) => d(e).directory !== null, f = /* @__PURE__ */ new Map(), ae = (e = "") => {
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
	let l = e !== "" && ie(e), u = {
		hasResolvableSource: l,
		hasWindow: n,
		hasDocument: r,
		isBundled: !l,
		isDevelopment: s || c,
		hasHMR: s,
		isViteDev: c
	};
	return f.set(e, u), u;
}, oe = class {
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
		this.userConfigData = n, this.mergedConfig = s(t, n);
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
	getEnvironmentInfo = () => ae(this.pluginId);
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
}, se = "data-css-id", p = (e, t) => new Promise((n, r) => {
	let i = document.createElement("link");
	i.rel = "stylesheet", i.href = t, i.setAttribute(se, e);
	let a = setTimeout(() => {
		i.parentNode && i.parentNode.removeChild(i), r(/* @__PURE__ */ Error(`[${e}] Timeout loading CSS from: ${t}`));
	}, 5e3);
	i.onload = () => {
		clearTimeout(a), n();
	}, i.onerror = () => {
		clearTimeout(a), i.parentNode && i.parentNode.removeChild(i), r(/* @__PURE__ */ Error(`[${e}] Failed to load CSS from: ${t}`));
	}, document.head.appendChild(i);
}), ce = (e) => document.querySelectorAll(`[${se}="${e}"]`).length > 0, le = 1e4, ue = (e) => Promise.resolve(h(e)), m = (e) => new Promise((t) => {
	if (h(e)) return t(!0);
	if (typeof MutationObserver > "u") return t(!1);
	let n = !1, r = (e) => {
		n || (n = !0, i.disconnect(), clearTimeout(o), window.removeEventListener("load", a), t(e));
	}, i = new MutationObserver(() => {
		h(e) && r(!0);
	});
	i.observe(document.documentElement, {
		childList: !0,
		subtree: !0,
		attributeFilter: ["href", "rel"]
	});
	let a = () => requestAnimationFrame(() => r(h(e)));
	document.readyState === "complete" ? a() : window.addEventListener("load", a, { once: !0 });
	let o = setTimeout(() => r(h(e)), le);
}), h = (e) => {
	if (ce(e)) return !0;
	try {
		return window.getComputedStyle(document.documentElement).getPropertyValue(`--cssimported-${e}`).trim() !== "";
	} catch {
		return !1;
	}
}, de = "--r-main-color", g = () => {
	if (typeof document > "u" || typeof window > "u") return !1;
	try {
		return getComputedStyle(document.documentElement).getPropertyValue(de).trim() !== "";
	} catch {
		return !1;
	}
}, _ = (e = 1e3) => g() ? Promise.resolve(!0) : new Promise((t) => {
	let n = Date.now() + e, r = () => {
		g() ? t(!0) : Date.now() >= n ? t(!1) : setTimeout(r, 16);
	};
	r();
}), fe = () => g(), pe = class {
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
}, v = (e) => new Proxy(e, { get: (e, t) => {
	if (t in e) return e[t];
	let n = t.toString();
	if (typeof console[n] == "function") return (...t) => {
		e.debugLog(n, ...t);
	};
} }), me = v(new pe()), he = () => v(new pe()), y = /* @__PURE__ */ new Set(), b = (e, t) => {
	let n = `${e}::${t}`;
	y.has(n) || (y.add(n), console.warn(`[${e}] ${t}`));
}, ge = (e) => [`dist/plugin/${e}/${e}.css`, `plugin/${e}/${e}.css`], _e = (e) => typeof e == "string" && e.trim() !== "", x = async (e, t) => {
	let { cssautoload: n, csspath: r, debug: i = !1 } = t;
	if (n === !1 || r === !1) return i && console.log(`[${e}] CSS loading is switched off`), { status: "skipped" };
	if (_e(r)) {
		let t = r.trim(), n = h(e), a = n && !!document.querySelector(`[data-css-id="${e}"]`);
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
	if (h(e)) return i && console.log(`[${e}] CSS is already imported, skipping`), { status: "present" };
	let { directory: a } = d(e);
	if (a !== null || n === !0) {
		let t = [...a === null ? [] : [`${a}${e}.css`], ...ge(e)].filter((e, t, n) => n.indexOf(e) === t);
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
	return m(e).then((t) => {
		t || b(e, `CSS could not be autoloaded here, because the plugin is part of a bundle. Import it once in your own code: import 'reveal.js-${e}/${e}.css'`);
	}), { status: "advised" };
};
async function ve(e, t) {
	if ("getEnvironmentInfo" in e && t) {
		let n = e, r = n.userConfig, i = "cssautoload" in r && r.cssautoload !== "auto" ? t.cssautoload : void 0;
		return x(n.pluginId, {
			...t,
			cssautoload: i
		});
	}
	let { id: n, cssautoload: r, csspath: i, debug: a } = e;
	return x(n, {
		cssautoload: r === "auto" ? void 0 : r,
		csspath: i,
		debug: a
	});
}
// src/utils/plugin-tools/event-tools.ts
var ye = /* @__PURE__ */ t({
	addDirectionEvents: () => C,
	addMoreDirectionEvents: () => Se,
	addScrollModeEvents: () => Ce
}), be = Symbol.for("reveal.js-plugintoolkit.directionEvents"), S = Symbol.for("reveal.js-plugintoolkit.scrollModeEvents"), xe = (e, t, n) => {
	Object.defineProperty(e, t, {
		value: n,
		configurable: !0,
		enumerable: !1,
		writable: !1
	});
}, C = (e) => {
	if (e[be]) return;
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
	}), xe(e, be, !0);
}, Se = C, Ce = (e) => {
	if (e[S]) return () => {};
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
		i.disconnect(), delete e[S];
	};
	return xe(e, S, a), a;
}, we = /* @__PURE__ */ t({
	SectionType: () => Te,
	getSectionType: () => D,
	getStack: () => De,
	isHorizontal: () => Ee,
	isSection: () => w,
	isStack: () => T,
	isVertical: () => E
}), Te = /* @__PURE__ */ function(e) {
	return e.HORIZONTAL = "horizontal", e.STACK = "stack", e.VERTICAL = "vertical", e.INVALID = "invalid", e;
}({}), w = (e) => e instanceof HTMLElement && e.tagName === "SECTION", T = (e) => w(e) ? Array.from(e.children).some((e) => e instanceof HTMLElement && e.tagName === "SECTION") : !1, E = (e) => w(e) ? e.parentElement instanceof HTMLElement && e.parentElement.tagName === "SECTION" : !1, Ee = (e) => w(e) && !E(e) && !T(e), De = (e) => {
	if (!w(e)) return null;
	if (E(e)) {
		let t = e.parentElement;
		if (t instanceof HTMLElement && T(t)) return t;
	}
	return null;
}, D = (e) => w(e) ? E(e) ? "vertical" : T(e) ? "stack" : "horizontal" : "invalid", Oe = /* @__PURE__ */ t({
	copyDataAttributes: () => O,
	createNode: () => k
}), O = (e, t, n) => {
	for (let r of Array.from(e.attributes)) r.nodeName.startsWith("data") && (!n || r.nodeName !== n) && t.setAttribute(r.nodeName, r.nodeValue || "");
}, k = (e) => document.createRange().createContextualFragment(e).firstElementChild, ke = /* @__PURE__ */ t({ sanitizeText: () => A }), A = (e) => e.toLowerCase().replace(/\s+/g, "").replace(/[^\p{L}\p{N}-]/gu, ""), Ae = /* @__PURE__ */ t({ addThemeColor: () => L }), j = Symbol.for("reveal.js-plugintoolkit.themeColor"), M = "has-light-background", N = "has-dark-background", je = "--c-theme-color", Me = "--c-theme-heading-color", Ne = {
	text: "section",
	heading: "h1"
}, Pe = "c-theme-inverted", Fe = "reveal-scroll", Ie = "stack", Le = (e, t, n) => {
	Object.defineProperty(e, t, {
		value: n,
		configurable: !0,
		enumerable: !1,
		writable: !1
	});
}, Re = (e) => {
	let t = e.getElementsByClassName("slides")[0];
	if (!t) return null;
	let n = document.createElement("section"), r = document.createElement(Ne.heading);
	n.appendChild(r), t.appendChild(n);
	let i = () => ({
		text: getComputedStyle(n).getPropertyValue("color"),
		heading: getComputedStyle(r).getPropertyValue("color")
	}), a = i();
	n.classList.add(M);
	let o = i(), s = "dark";
	return o.text === a.text && o.heading === a.heading && (s = "light", n.classList.remove(M), n.classList.add(N), o = i()), n.remove(), {
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
}, P = (e, t) => e?.classList.contains(t) ?? !1, ze = (e, t, n) => {
	let r = P(n, Fe) ? n : t;
	if (P(r, M)) return "light";
	if (P(r, N)) return "dark";
	let i = e.getCurrentSlide?.()?.parentElement ?? null;
	if (i && P(i, Ie)) {
		if (P(i, M)) return "light";
		if (P(i, N)) return "dark";
	}
	return null;
}, F = (e, t, n) => {
	let r = ze(e, t, e.getViewportElement());
	return n.theme === "dark" ? r === "light" : r === "dark";
}, I = (e, t, n) => {
	let r = (e) => n ? e.inverse : e.regular;
	e.style.setProperty(je, r(t.text)), e.style.setProperty(Me, r(t.heading)), e.classList.toggle(Pe, n);
}, Be = async (e, { timeout: t = 1e3 }) => {
	let n = e.getRevealElement();
	if (!n) return null;
	let r = e.getViewportElement() ?? n;
	await _(t);
	let i = Re(n);
	if (!i) return null;
	let a = F(e, n, i);
	I(r, i, a);
	let o = () => {
		let t = F(e, n, i);
		t !== a && (a = t, I(r, i, t));
	}, s = new MutationObserver(o);
	return s.observe(n, {
		attributes: !0,
		attributeFilter: ["class"]
	}), r !== n && s.observe(r, {
		attributes: !0,
		attributeFilter: ["class"]
	}), e.on("slidechanged", o), i;
}, L = (e, t = {}) => {
	let n = e[j];
	if (n) return n;
	let r = Be(e, t);
	return Le(e, j, r), r;
}, Ve = /* @__PURE__ */ t({ addSlideStates: () => Ke }), R = Symbol.for("reveal.js-plugintoolkit.slideStates"), He = "reveal-scroll", z = "data-toolkit-stack-state", Ue = (e, t, n) => {
	Object.defineProperty(e, t, {
		value: n,
		configurable: !0,
		enumerable: !1,
		writable: !1
	});
}, B = (e) => (e ?? "").split(" ").filter(Boolean), V = (e) => Array.from(new Set(e)), H = (e) => e.classList.contains(He), U = (e) => {
	if (e.querySelector(".scroll-page")) return !1;
	for (let t of Array.from(e.querySelectorAll(".slides > section"))) {
		let e = t.querySelectorAll(":scope > section");
		if (!e.length) continue;
		let n = t.getAttribute("data-state");
		for (let t of Array.from(e)) n ? t.setAttribute(z, n) : t.removeAttribute(z);
	}
	return !0;
}, W = (e) => {
	if (!e) return [];
	let t = e.parentElement;
	return V([...t?.tagName === "SECTION" ? B(t.getAttribute("data-state")) : B(e.getAttribute(z)), ...B(e.getAttribute("data-state"))]);
}, G = (e, t, n, { dispatch: r }) => {
	let i = W(n);
	for (let e of t.applied) i.includes(e) || t.host.classList.remove(e);
	for (let n of i) t.host.classList.add(n), r && !t.applied.includes(n) && e.dispatchEvent({ type: n });
	t.applied = i;
}, We = (e) => {
	e.warned || e.stacksRead || e.revealElement.querySelector(".scroll-page section[data-index-v]:not([data-index-v=\"0\"])") && (e.warned = !0, console.warn("[plugintoolkit]: addSlideStates was called after the deck had already switched to scroll view, so the states of stacks are unknown until it leaves scroll view once. Slides still get their own states. Call it from a plugin's init to avoid this."));
}, Ge = (e) => {
	let t = e.getRevealElement();
	if (!t) return null;
	let n = e.getViewportElement() ?? t, r = H(n), i = {
		revealElement: t,
		host: n,
		inScrollView: r,
		applied: [],
		regularStates: r ? [] : W(e.getCurrentSlide()),
		switching: !1,
		stacksRead: U(t),
		warned: !1
	};
	r && (We(i), G(e, i, e.getCurrentSlide(), { dispatch: !1 }));
	let a = () => {
		let r = H(n);
		r !== i.inScrollView && (i.inScrollView = r, r ? (We(i), i.applied = V([...i.applied, ...i.regularStates]), i.switching = !0, queueMicrotask(() => {
			i.switching = !1;
		}), G(e, i, e.getCurrentSlide(), { dispatch: !1 })) : (G(e, i, e.getCurrentSlide(), { dispatch: !1 }), i.applied = [], i.regularStates = W(e.getCurrentSlide()), i.stacksRead = U(t) || i.stacksRead));
	};
	return new MutationObserver(a).observe(n, {
		attributes: !0,
		attributeFilter: ["class"]
	}), e.on("ready", () => {
		a(), i.inScrollView ? G(e, i, e.getCurrentSlide(), { dispatch: !1 }) : (i.regularStates = W(e.getCurrentSlide()), i.stacksRead = U(t) || i.stacksRead);
	}), e.on("slidechanged", (t) => {
		a();
		let { currentSlide: n } = t, r = n ?? e.getCurrentSlide();
		i.inScrollView ? G(e, i, r, { dispatch: !i.switching }) : i.regularStates = W(r);
	}), i;
}, Ke = (e) => {
	if (e[R]) return;
	let t = Ge(e);
	t && Ue(e, R, t);
}, qe = /* @__PURE__ */ t({ addAnchor: () => $e }), Je = "data-toolkit-anchor", Ye = "--toolkit-anchor-height", Xe = (e) => e.getConfig(), Ze = (e) => Xe(e).view === "print" || /print-pdf/i.test(window.location.search) || document.documentElement.classList.contains("print-pdf"), Qe = (e, t, n, r, i) => {
	let { style: a } = t, o = r === "top";
	a.setProperty("display", i.print !== "keep" && Ze(e) ? "none" : "block"), a.setProperty("height", "0"), a.setProperty("margin", "0"), a.setProperty("padding", "0"), a.setProperty("z-index", String(i.zIndex ?? 2)), n ? (a.setProperty("position", "sticky"), a.setProperty("inset-inline", "auto"), a.setProperty("top", o ? "0" : "100%"), a.setProperty("bottom", o ? "100%" : "0")) : (a.setProperty("position", "fixed"), a.setProperty("inset-inline", "0"), a.setProperty("top", o ? "0" : "auto"), a.setProperty("bottom", o ? "auto" : "0")), Xe(e).rtl ? a.setProperty("direction", "rtl") : a.removeProperty("direction");
}, $e = (e, t = {}) => {
	let n = e.getRevealElement();
	if (!n) return null;
	let r = t.edge === "bottom" ? "bottom" : "top", i = e.getViewportElement() ?? document.body, a = i === n, o = document.createElement("div");
	o.setAttribute(Je, r), t.className && (o.className = t.className);
	let s = () => Qe(e, o, a, r, t);
	s(), n.appendChild(o), new MutationObserver(s).observe(n, {
		attributes: !0,
		attributeFilter: ["class"]
	}), e.on("ready", s);
	let c = () => o.style.setProperty(Ye, `${i.clientHeight}px`);
	return c(), new ResizeObserver(c).observe(i), o;
}, et = /* @__PURE__ */ t({
	ENTRANCE_ATTRIBUTE: () => J,
	IN_EVENT: () => q,
	SHOWN_EVENT: () => K,
	announce: () => it,
	markPending: () => Q,
	pendingAround: () => $,
	reset: () => at,
	stateOf: () => X,
	whenShown: () => ot
}), K = "entranceshown", q = "entrancein", J = "data-entrance", tt = {
	pending: 0,
	shown: 1,
	in: 2
}, Y = Symbol.for("reveal.js-plugintoolkit.entranceTimers"), nt = () => typeof window.matchMedia == "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function X(e) {
	let t = e.getAttribute(J);
	return t === "pending" || t === "shown" || t === "in" ? t : null;
}
function Z(e, t) {
	if (e.setAttribute(J, t), t === "pending") return;
	let n = {
		element: e,
		state: t
	};
	e.dispatchEvent(new CustomEvent(t === "shown" ? K : q, {
		bubbles: !0,
		detail: n
	}));
}
function rt(e) {
	for (let t of e[Y] ?? []) window.clearTimeout(t);
	delete e[Y];
}
function Q(e) {
	rt(e), Z(e, "pending");
}
function it(e, t) {
	rt(e);
	let n = Math.max(0, t.delay ?? 0), r = Math.max(0, t.duration), i = Number.parseFloat(e.dataset.entranceAt ?? ""), a = Number.isFinite(i) ? Math.min(1, Math.max(0, i)) : .5;
	Z(e, "pending"), e[Y] = [window.setTimeout(() => Z(e, "shown"), n + r * a), window.setTimeout(() => {
		X(e) === "pending" && Z(e, "shown"), Z(e, "in"), delete e[Y];
	}, n + r)];
}
function at(e) {
	Q(e);
}
function $(e, t = "shown") {
	let n = [];
	for (let r = e; r && r.tagName !== "SECTION"; r = r.parentElement) {
		let e = X(r);
		e && tt[e] < tt[t] && n.push(r);
	}
	return n;
}
function ot(e, t = "shown", n) {
	if (n?.aborted) return Promise.resolve(!1);
	if (nt()) return Promise.resolve(!0);
	let r = $(e, t);
	return r.length ? new Promise((i) => {
		let a = () => {
			$(e, t).length || (s(), i(!0));
		}, o = () => {
			s(), i(!1);
		}, s = () => {
			for (let e of r) e.removeEventListener(K, a), e.removeEventListener(q, a);
			n?.removeEventListener("abort", o);
		};
		for (let e of r) e.addEventListener(K, a), e.addEventListener(q, a);
		n?.addEventListener("abort", o);
	}) : Promise.resolve(!0);
}
// src/utils/plugin-tools/index.ts
var st = /* @__PURE__ */ t({
	addAnchor: () => $e,
	addDirectionEvents: () => C,
	addMoreDirectionEvents: () => Se,
	addScrollModeEvents: () => Ce,
	addSlideStates: () => Ke,
	addThemeColor: () => L,
	announce: () => it,
	copyDataAttributes: () => O,
	createNode: () => k,
	getSectionType: () => D,
	getStack: () => De,
	isHorizontal: () => Ee,
	isJSON: () => r,
	isSection: () => w,
	isStack: () => T,
	isVertical: () => E,
	markPending: () => Q,
	pendingAround: () => $,
	reset: () => at,
	sanitizeText: () => A,
	toJSONString: () => i,
	whenShown: () => ot
});
export { oe as PluginBase, h as checkCssImported, n as configTools, he as createPluginDebug, Oe as domTools, et as entranceTools, ye as eventTools, d as findPluginSource, ie as hasResolvableSource, ue as isCssImported, fe as isThemeApplied, ve as pluginCSS, me as pluginDebug, st as pluginTools, qe as positionTools, we as sectionTools, Ve as stateTools, ke as textTools, Ae as themeTools, b as warnOnce, m as whenCssImported, _ as whenThemeApplied };
