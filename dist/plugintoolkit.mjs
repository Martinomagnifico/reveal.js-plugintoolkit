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
}, d = (e) => u(e).directory !== null, f = /* @__PURE__ */ new Map(), ee = (e = "") => {
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
}, te = class {
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
	getEnvironmentInfo = () => ee(this.pluginId);
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
}, p = "data-css-id", m = (e, t) => new Promise((n, r) => {
	let i = document.createElement("link");
	i.rel = "stylesheet", i.href = t, i.setAttribute(p, e);
	let a = setTimeout(() => {
		i.parentNode && i.parentNode.removeChild(i), r(/* @__PURE__ */ Error(`[${e}] Timeout loading CSS from: ${t}`));
	}, 5e3);
	i.onload = () => {
		clearTimeout(a), n();
	}, i.onerror = () => {
		clearTimeout(a), i.parentNode && i.parentNode.removeChild(i), r(/* @__PURE__ */ Error(`[${e}] Failed to load CSS from: ${t}`));
	}, document.head.appendChild(i);
}), ne = (e) => document.querySelectorAll(`[${p}="${e}"]`).length > 0, re = 1e4, ie = (e) => Promise.resolve(g(e)), h = (e) => new Promise((t) => {
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
	let o = setTimeout(() => r(g(e)), re);
}), g = (e) => {
	if (ne(e)) return !0;
	try {
		return window.getComputedStyle(document.documentElement).getPropertyValue(`--cssimported-${e}`).trim() !== "";
	} catch {
		return !1;
	}
}, ae = "--r-main-color", _ = () => {
	if (typeof document > "u" || typeof window > "u") return !1;
	try {
		return getComputedStyle(document.documentElement).getPropertyValue(ae).trim() !== "";
	} catch {
		return !1;
	}
}, v = (e = 1e3) => _() ? Promise.resolve(!0) : new Promise((t) => {
	let n = Date.now() + e, r = () => {
		if (_()) {
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
}), oe = () => _(), se = class {
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
		if (!(!this.debugMode && e !== "error" || typeof n != "function")) {
			if (e === "group" || e === "groupCollapsed") {
				t.length > 0 && typeof t[0] == "string" ? this.emit(e, [`[${this.label}]: ${t[0]}`, ...t.slice(1)]) : this.emit(e, [`[${this.label}]:`, ...t]);
				return;
			}
			if (e === "groupEnd") {
				this.emit(e, []);
				return;
			}
			if (e === "table") {
				t.length === 1 ? this.table(t[0]) : t.length === 2 ? (t[0], this.table(t[0], t[1])) : t.length >= 3 && this.table(t[0], t[1], t[2]);
				return;
			}
			this.groupDepth > 0 ? this.emit(e, t) : t.length > 0 && typeof t[0] == "string" ? this.emit(e, [`[${this.label}]: ${t[0]}`, ...t.slice(1)]) : this.emit(e, [`[${this.label}]:`, ...t]);
		}
	}
}, ce = (e) => new Proxy(e, { get: (e, t) => {
	if (t in e) return e[t];
	let n = t.toString();
	if (typeof console[n] == "function") return (...t) => {
		e.debugLog(n, ...t);
	};
} }), le = ce(new se()), ue = () => ce(new se()), y = /* @__PURE__ */ new Set(), b = (e, t) => {
	let n = `${e}::${t}`;
	y.has(n) || (y.add(n), console.warn(`[${e}] ${t}`));
}, de = (e) => [`dist/plugin/${e}/${e}.css`, `plugin/${e}/${e}.css`], fe = (e) => typeof e == "string" && e.trim() !== "", x = async (e, t) => {
	let { cssautoload: n, csspath: r, debug: i = !1 } = t;
	if (n === !1 || r === !1) return i && console.log(`[${e}] CSS loading is switched off`), { status: "skipped" };
	if (fe(r)) {
		let t = r.trim(), n = g(e), a = n && !!document.querySelector(`[data-css-id="${e}"]`);
		try {
			return await m(e, t), i && console.log(`[${e}] CSS loaded from: ${t}`), n && b(e, `Loaded CSS from ${t}, but a stylesheet for this plugin was already on the page (${a ? "a tagged <link>" : "an import or inline <style>"}) — csspath adds one, it cannot remove one. Both are live and the cascade decides. Remove the other import or <link>, or drop csspath.`), {
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
		let t = [...a === null ? [] : [`${a}${e}.css`], ...de(e)].filter((e, t, n) => n.indexOf(e) === t);
		for (let n of t) try {
			return await m(e, n), i && console.log(`[${e}] CSS loaded from: ${n}`), {
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
async function pe(e, t) {
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
//#endregion
//#region src/utils/plugin-tools/event-tools.ts
var me = /* @__PURE__ */ n({
	addDirectionEvents: () => T,
	addMoreDirectionEvents: () => E,
	addScrollModeEvents: () => D
}), S = Symbol.for("reveal.js-plugintoolkit.directionEvents"), C = Symbol.for("reveal.js-plugintoolkit.scrollModeEvents"), w = (e, t, n) => {
	Object.defineProperty(e, t, {
		value: n,
		configurable: !0,
		enumerable: !1,
		writable: !1
	});
}, T = (e) => {
	if (e[S]) return;
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
	}), w(e, S, !0);
}, E = T, D = (e) => {
	if (e[C]) return () => {};
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
		i.disconnect(), delete e[C];
	};
	return w(e, C, a), a;
}, he = /* @__PURE__ */ n({
	SectionType: () => ge,
	getSectionType: () => N,
	getStack: () => M,
	isHorizontal: () => j,
	isSection: () => O,
	isStack: () => k,
	isVertical: () => A
}), ge = /* @__PURE__ */ function(e) {
	return e.HORIZONTAL = "horizontal", e.STACK = "stack", e.VERTICAL = "vertical", e.INVALID = "invalid", e;
}({}), O = (e) => e instanceof HTMLElement && e.tagName === "SECTION", k = (e) => O(e) ? Array.from(e.children).some((e) => e instanceof HTMLElement && e.tagName === "SECTION") : !1, A = (e) => O(e) ? e.parentElement instanceof HTMLElement && e.parentElement.tagName === "SECTION" : !1, j = (e) => O(e) && !A(e) && !k(e), M = (e) => {
	if (!O(e)) return null;
	if (A(e)) {
		let t = e.parentElement;
		if (t instanceof HTMLElement && k(t)) return t;
	}
	return null;
}, N = (e) => O(e) ? A(e) ? "vertical" : k(e) ? "stack" : "horizontal" : "invalid", _e = /* @__PURE__ */ n({
	isJSON: () => P,
	toJSONString: () => F
}), P = (e) => {
	try {
		return JSON.parse(e) && !!e;
	} catch {
		return !1;
	}
}, F = (e) => {
	if (e == null) return "";
	if (P(e)) return e;
	if (typeof e == "object") return JSON.stringify(e, null, 2);
	if (typeof e == "string") {
		let t = e.replace(/[“”]/g, "\"").replace(/[‘’]/g, "'");
		if (P(t)) return t;
		let n = t.trim().replace(/'/g, "\"");
		return n.charAt(0) === "{" ? n : `{${n}}`;
	}
	return "";
}, ve = /* @__PURE__ */ n({
	copyDataAttributes: () => I,
	createNode: () => L
}), I = (e, t, n) => {
	for (let r of Array.from(e.attributes)) r.nodeName.startsWith("data") && (!n || r.nodeName !== n) && t.setAttribute(r.nodeName, r.nodeValue || "");
}, L = (e) => document.createRange().createContextualFragment(e).firstElementChild, ye = /* @__PURE__ */ n({ sanitizeText: () => R }), R = (e) => e.toLowerCase().replace(/\s+/g, "").replace(/[^\p{L}\p{N}-]/gu, ""), be = /* @__PURE__ */ n({ addThemeColor: () => G }), z = Symbol.for("reveal.js-plugintoolkit.themeColor"), B = "has-light-background", V = "has-dark-background", xe = "--c-theme-color", Se = "--c-theme-heading-color", Ce = {
	text: "section",
	heading: "h1"
}, we = "c-theme-inverted", Te = "reveal-scroll", Ee = "stack", De = (e, t, n) => {
	Object.defineProperty(e, t, {
		value: n,
		configurable: !0,
		enumerable: !1,
		writable: !1
	});
}, Oe = (e) => {
	let t = e.getElementsByClassName("slides")[0];
	if (!t) return null;
	let n = document.createElement("section"), r = document.createElement(Ce.heading);
	n.appendChild(r), t.appendChild(n);
	let i = () => ({
		text: getComputedStyle(n).getPropertyValue("color"),
		heading: getComputedStyle(r).getPropertyValue("color")
	}), a = i();
	n.classList.add(B);
	let o = i(), s = "dark";
	return o.text === a.text && o.heading === a.heading && (s = "light", n.classList.remove(B), n.classList.add(V), o = i()), n.remove(), {
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
}, H = (e, t) => e?.classList.contains(t) ?? !1, ke = (e, t, n) => {
	let r = H(n, Te) ? n : t;
	if (H(r, B)) return "light";
	if (H(r, V)) return "dark";
	let i = e.getCurrentSlide?.()?.parentElement ?? null;
	if (i && H(i, Ee)) {
		if (H(i, B)) return "light";
		if (H(i, V)) return "dark";
	}
	return null;
}, U = (e, t, n) => {
	let r = ke(e, t, e.getViewportElement());
	return n.theme === "dark" ? r === "light" : r === "dark";
}, W = (e, t, n) => {
	let r = (e) => n ? e.inverse : e.regular;
	e.style.setProperty(xe, r(t.text)), e.style.setProperty(Se, r(t.heading)), e.classList.toggle(we, n);
}, Ae = async (e, { timeout: t = 1e3 }) => {
	let n = e.getRevealElement();
	if (!n) return null;
	let r = e.getViewportElement() ?? n;
	await v(t);
	let i = Oe(n);
	if (!i) return null;
	let a = U(e, n, i);
	W(r, i, a);
	let o = () => {
		let t = U(e, n, i);
		t !== a && (a = t, W(r, i, t));
	}, s = new MutationObserver(o);
	return s.observe(n, {
		attributes: !0,
		attributeFilter: ["class"]
	}), r !== n && s.observe(r, {
		attributes: !0,
		attributeFilter: ["class"]
	}), e.on("slidechanged", o), i;
}, G = (e, t = {}) => {
	let n = e[z];
	if (n) return n;
	let r = Ae(e, t);
	return De(e, z, r), r;
}, je = /* @__PURE__ */ n({ addSlideStates: () => Ie }), K = Symbol.for("reveal.js-plugintoolkit.slideStates"), Me = "reveal-scroll", q = "data-toolkit-stack-state", Ne = (e, t, n) => {
	Object.defineProperty(e, t, {
		value: n,
		configurable: !0,
		enumerable: !1,
		writable: !1
	});
}, J = (e) => (e ?? "").split(" ").filter(Boolean), Y = (e) => Array.from(new Set(e)), X = (e) => e.classList.contains(Me), Z = (e) => {
	if (e.querySelector(".scroll-page")) return !1;
	for (let t of Array.from(e.querySelectorAll(".slides > section"))) {
		let e = t.querySelectorAll(":scope > section");
		if (!e.length) continue;
		let n = t.getAttribute("data-state");
		for (let t of Array.from(e)) n ? t.setAttribute(q, n) : t.removeAttribute(q);
	}
	return !0;
}, Q = (e) => {
	if (!e) return [];
	let t = e.parentElement;
	return Y([...t?.tagName === "SECTION" ? J(t.getAttribute("data-state")) : J(e.getAttribute(q)), ...J(e.getAttribute("data-state"))]);
}, $ = (e, t, n, { dispatch: r }) => {
	let i = Q(n);
	for (let e of t.applied) i.includes(e) || t.host.classList.remove(e);
	for (let n of i) t.host.classList.add(n), r && !t.applied.includes(n) && e.dispatchEvent({ type: n });
	t.applied = i;
}, Pe = (e) => {
	e.warned || e.stacksRead || e.revealElement.querySelector(".scroll-page section[data-index-v]:not([data-index-v=\"0\"])") && (e.warned = !0, console.warn("[plugintoolkit]: addSlideStates was called after the deck had already switched to scroll view, so the states of stacks are unknown until it leaves scroll view once. Slides still get their own states. Call it from a plugin's init to avoid this."));
}, Fe = (e) => {
	let t = e.getRevealElement();
	if (!t) return null;
	let n = e.getViewportElement() ?? t, r = X(n), i = {
		revealElement: t,
		host: n,
		inScrollView: r,
		applied: [],
		regularStates: r ? [] : Q(e.getCurrentSlide()),
		switching: !1,
		stacksRead: Z(t),
		warned: !1
	};
	r && (Pe(i), $(e, i, e.getCurrentSlide(), { dispatch: !1 }));
	let a = () => {
		let r = X(n);
		r !== i.inScrollView && (i.inScrollView = r, r ? (Pe(i), i.applied = Y([...i.applied, ...i.regularStates]), i.switching = !0, queueMicrotask(() => {
			i.switching = !1;
		}), $(e, i, e.getCurrentSlide(), { dispatch: !1 })) : ($(e, i, e.getCurrentSlide(), { dispatch: !1 }), i.applied = [], i.regularStates = Q(e.getCurrentSlide()), i.stacksRead = Z(t) || i.stacksRead));
	};
	return new MutationObserver(a).observe(n, {
		attributes: !0,
		attributeFilter: ["class"]
	}), e.on("ready", () => {
		a(), i.inScrollView ? $(e, i, e.getCurrentSlide(), { dispatch: !1 }) : (i.regularStates = Q(e.getCurrentSlide()), i.stacksRead = Z(t) || i.stacksRead);
	}), e.on("slidechanged", (t) => {
		a();
		let { currentSlide: n } = t, r = n ?? e.getCurrentSlide();
		i.inScrollView ? $(e, i, r, { dispatch: !i.switching }) : i.regularStates = Q(r);
	}), i;
}, Ie = (e) => {
	if (e[K]) return;
	let t = Fe(e);
	t && Ne(e, K, t);
}, Le = /* @__PURE__ */ n({ addAnchor: () => Ue }), Re = "data-toolkit-anchor", ze = "--toolkit-anchor-height", Be = (e) => e.getConfig(), Ve = (e) => Be(e).view === "print" || /print-pdf/i.test(window.location.search) || document.documentElement.classList.contains("print-pdf"), He = (e, t, n, r, i) => {
	let { style: a } = t, o = r === "top";
	a.setProperty("display", i.print !== "keep" && Ve(e) ? "none" : "block"), a.setProperty("height", "0"), a.setProperty("margin", "0"), a.setProperty("padding", "0"), a.setProperty("z-index", String(i.zIndex ?? 2)), n ? (a.setProperty("position", "sticky"), a.setProperty("inset-inline", "auto"), a.setProperty("top", o ? "0" : "100%"), a.setProperty("bottom", o ? "100%" : "0")) : (a.setProperty("position", "fixed"), a.setProperty("inset-inline", "0"), a.setProperty("top", o ? "0" : "auto"), a.setProperty("bottom", o ? "auto" : "0")), Be(e).rtl ? a.setProperty("direction", "rtl") : a.removeProperty("direction");
}, Ue = (e, t = {}) => {
	let n = e.getRevealElement();
	if (!n) return null;
	let r = t.edge === "bottom" ? "bottom" : "top", i = e.getViewportElement() ?? document.body, a = i === n, o = document.createElement("div");
	o.setAttribute(Re, r), t.className && (o.className = t.className);
	let s = () => He(e, o, a, r, t);
	s(), n.appendChild(o), new MutationObserver(s).observe(n, {
		attributes: !0,
		attributeFilter: ["class"]
	}), e.on("ready", s);
	let c = () => o.style.setProperty(ze, `${i.clientHeight}px`);
	return c(), new ResizeObserver(c).observe(i), o;
}, We = /* @__PURE__ */ n({
	addAnchor: () => Ue,
	addDirectionEvents: () => T,
	addMoreDirectionEvents: () => E,
	addScrollModeEvents: () => D,
	addSlideStates: () => Ie,
	addThemeColor: () => G,
	copyDataAttributes: () => I,
	createNode: () => L,
	getSectionType: () => N,
	getStack: () => M,
	isHorizontal: () => j,
	isJSON: () => P,
	isSection: () => O,
	isStack: () => k,
	isVertical: () => A,
	sanitizeText: () => R,
	toJSONString: () => F
});
//#endregion
export { te as PluginBase, g as checkCssImported, _e as configTools, ue as createPluginDebug, ve as domTools, me as eventTools, u as findPluginSource, d as hasResolvableSource, ie as isCssImported, oe as isThemeApplied, pe as pluginCSS, le as pluginDebug, We as pluginTools, Le as positionTools, he as sectionTools, je as stateTools, ye as textTools, be as themeTools, b as warnOnce, h as whenCssImported, v as whenThemeApplied };
