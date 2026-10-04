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
}, d = (e) => u(e).directory !== null, ee = /* @__PURE__ */ new Map(), te = (e = "") => {
	let t = ee.get(e);
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
	return ee.set(e, u), u;
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
}), re = (e) => document.querySelectorAll(`[${f}="${e}"]`).length > 0, ie = 1e4, ae = (e) => Promise.resolve(h(e)), m = (e) => new Promise((t) => {
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
	let o = setTimeout(() => r(h(e)), ie);
}), h = (e) => {
	if (re(e)) return !0;
	try {
		return window.getComputedStyle(document.documentElement).getPropertyValue(`--cssimported-${e}`).trim() !== "";
	} catch {
		return !1;
	}
}, oe = "--r-main-color", g = () => {
	if (typeof document > "u" || typeof window > "u") return !1;
	try {
		return getComputedStyle(document.documentElement).getPropertyValue(oe).trim() !== "";
	} catch {
		return !1;
	}
}, se = (e = 1e3) => g() ? Promise.resolve(!0) : new Promise((t) => {
	let n = Date.now() + e, r = () => {
		if (g()) {
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
}), ce = () => g(), le = class {
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
}, ue = (e) => new Proxy(e, { get: (e, t) => {
	if (t in e) return e[t];
	let n = t.toString();
	if (typeof console[n] == "function") return (...t) => {
		e.debugLog(n, ...t);
	};
} }), de = ue(new le()), fe = () => ue(new le()), pe = /* @__PURE__ */ new Set(), _ = (e, t) => {
	let n = `${e}::${t}`;
	pe.has(n) || (pe.add(n), console.warn(`[${e}] ${t}`));
}, me = (e) => [`dist/plugin/${e}/${e}.css`, `plugin/${e}/${e}.css`], he = (e) => typeof e == "string" && e.trim() !== "", ge = async (e, t) => {
	let { cssautoload: n, csspath: r, debug: i = !1 } = t;
	if (n === !1 || r === !1) return i && console.log(`[${e}] CSS loading is switched off`), { status: "skipped" };
	if (he(r)) {
		let t = r.trim(), n = h(e), a = n && !!document.querySelector(`[data-css-id="${e}"]`);
		try {
			return await p(e, t), i && console.log(`[${e}] CSS loaded from: ${t}`), n && _(e, `Loaded CSS from ${t}, but a stylesheet for this plugin was already on the page (${a ? "a tagged <link>" : "an import or inline <style>"}) — csspath adds one, it cannot remove one. Both are live and the cascade decides. Remove the other import or <link>, or drop csspath.`), {
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
	let { directory: a } = u(e);
	if (a !== null || n === !0) {
		let t = [...a === null ? [] : [`${a}${e}.css`], ...me(e)].filter((e, t, n) => n.indexOf(e) === t);
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
		t || _(e, `CSS could not be autoloaded here, because the plugin is part of a bundle. Import it once in your own code: import 'reveal.js-${e}/${e}.css'`);
	}), { status: "advised" };
};
async function _e(e, t) {
	if ("getEnvironmentInfo" in e && t) {
		let n = e, r = n.userConfig, i = "cssautoload" in r && r.cssautoload !== "auto" ? t.cssautoload : void 0;
		return ge(n.pluginId, {
			...t,
			cssautoload: i
		});
	}
	let { id: n, cssautoload: r, csspath: i, debug: a } = e;
	return ge(n, {
		cssautoload: r === "auto" ? void 0 : r,
		csspath: i,
		debug: a
	});
}
//#endregion
//#region src/utils/plugin-tools/event-tools.ts
var ve = /* @__PURE__ */ n({
	addDirectionEvents: () => b,
	addMoreDirectionEvents: () => x,
	addScrollModeEvents: () => S
}), ye = Symbol.for("reveal.js-plugintoolkit.directionEvents"), v = Symbol.for("reveal.js-plugintoolkit.scrollModeEvents"), y = (e, t, n) => {
	Object.defineProperty(e, t, {
		value: n,
		configurable: !0,
		enumerable: !1,
		writable: !1
	});
}, b = (e) => {
	if (e[ye]) return;
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
	}), y(e, ye, !0);
}, x = b, S = (e) => {
	if (e[v]) return () => {};
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
		i.disconnect(), delete e[v];
	};
	return y(e, v, a), a;
}, be = /* @__PURE__ */ n({
	SectionType: () => xe,
	getSectionType: () => O,
	getStack: () => D,
	isHorizontal: () => E,
	isSection: () => C,
	isStack: () => w,
	isVertical: () => T
}), xe = /* @__PURE__ */ function(e) {
	return e.HORIZONTAL = "horizontal", e.STACK = "stack", e.VERTICAL = "vertical", e.INVALID = "invalid", e;
}({}), C = (e) => e instanceof HTMLElement && e.tagName === "SECTION", w = (e) => C(e) ? Array.from(e.children).some((e) => e instanceof HTMLElement && e.tagName === "SECTION") : !1, T = (e) => C(e) ? e.parentElement instanceof HTMLElement && e.parentElement.tagName === "SECTION" : !1, E = (e) => C(e) && !T(e) && !w(e), D = (e) => {
	if (!C(e)) return null;
	if (T(e)) {
		let t = e.parentElement;
		if (t instanceof HTMLElement && w(t)) return t;
	}
	return null;
}, O = (e) => C(e) ? T(e) ? "vertical" : w(e) ? "stack" : "horizontal" : "invalid", Se = /* @__PURE__ */ n({
	isJSON: () => k,
	toJSONString: () => A
}), k = (e) => {
	try {
		return JSON.parse(e) && !!e;
	} catch {
		return !1;
	}
}, A = (e) => {
	if (e == null) return "";
	if (k(e)) return e;
	if (typeof e == "object") return JSON.stringify(e, null, 2);
	if (typeof e == "string") {
		let t = e.replace(/[“”]/g, "\"").replace(/[‘’]/g, "'");
		if (k(t)) return t;
		let n = t.trim().replace(/'/g, "\"");
		return n.charAt(0) === "{" ? n : `{${n}}`;
	}
	return "";
}, Ce = /* @__PURE__ */ n({
	copyDataAttributes: () => j,
	createNode: () => M
}), j = (e, t, n) => {
	for (let r of Array.from(e.attributes)) r.nodeName.startsWith("data") && (!n || r.nodeName !== n) && t.setAttribute(r.nodeName, r.nodeValue || "");
}, M = (e) => document.createRange().createContextualFragment(e).firstElementChild, we = /* @__PURE__ */ n({ sanitizeText: () => N }), N = (e) => e.toLowerCase().replace(/\s+/g, "").replace(/[^\p{L}\p{N}-]/gu, ""), Te = /* @__PURE__ */ n({ addThemeColor: () => Le }), P = Symbol.for("reveal.js-plugintoolkit.themeColor"), F = "has-light-background", I = "has-dark-background", Ee = "--c-theme-color", De = "--c-theme-heading-color", Oe = {
	text: "section",
	heading: "h1"
}, ke = "c-theme-inverted", Ae = "reveal-scroll", je = "stack", Me = (e, t, n) => {
	Object.defineProperty(e, t, {
		value: n,
		configurable: !0,
		enumerable: !1,
		writable: !1
	});
}, Ne = (e) => {
	let t = e.getElementsByClassName("slides")[0];
	if (!t) return null;
	let n = document.createElement("section"), r = document.createElement(Oe.heading);
	n.appendChild(r), t.appendChild(n);
	let i = () => ({
		text: getComputedStyle(n).getPropertyValue("color"),
		heading: getComputedStyle(r).getPropertyValue("color")
	}), a = i();
	n.classList.add(F);
	let o = i(), s = "dark";
	return o.text === a.text && o.heading === a.heading && (s = "light", n.classList.remove(F), n.classList.add(I), o = i()), n.remove(), {
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
}, L = (e, t) => e?.classList.contains(t) ?? !1, Pe = (e, t, n) => {
	let r = L(n, Ae) ? n : t;
	if (L(r, F)) return "light";
	if (L(r, I)) return "dark";
	let i = e.getCurrentSlide?.()?.parentElement ?? null;
	if (i && L(i, je)) {
		if (L(i, F)) return "light";
		if (L(i, I)) return "dark";
	}
	return null;
}, R = (e, t, n) => {
	let r = Pe(e, t, e.getViewportElement());
	return n.theme === "dark" ? r === "light" : r === "dark";
}, Fe = (e, t, n) => {
	let r = (e) => n ? e.inverse : e.regular;
	e.style.setProperty(Ee, r(t.text)), e.style.setProperty(De, r(t.heading)), e.classList.toggle(ke, n);
}, Ie = async (e, { timeout: t = 1e3 }) => {
	let n = e.getRevealElement();
	if (!n) return null;
	let r = e.getViewportElement() ?? n;
	await se(t);
	let i = Ne(n);
	if (!i) return null;
	let a = R(e, n, i);
	Fe(r, i, a);
	let o = () => {
		let t = R(e, n, i);
		t !== a && (a = t, Fe(r, i, t));
	}, s = new MutationObserver(o);
	return s.observe(n, {
		attributes: !0,
		attributeFilter: ["class"]
	}), r !== n && s.observe(r, {
		attributes: !0,
		attributeFilter: ["class"]
	}), e.on("slidechanged", o), i;
}, Le = (e, t = {}) => {
	let n = e[P];
	if (n) return n;
	let r = Ie(e, t);
	return Me(e, P, r), r;
}, Re = /* @__PURE__ */ n({ addSlideStates: () => Ke }), ze = Symbol.for("reveal.js-plugintoolkit.slideStates"), Be = "reveal-scroll", z = "data-toolkit-stack-state", Ve = (e, t, n) => {
	Object.defineProperty(e, t, {
		value: n,
		configurable: !0,
		enumerable: !1,
		writable: !1
	});
}, B = (e) => (e ?? "").split(" ").filter(Boolean), He = (e) => Array.from(new Set(e)), Ue = (e) => e.classList.contains(Be), V = (e) => {
	if (e.querySelector(".scroll-page")) return !1;
	for (let t of Array.from(e.querySelectorAll(".slides > section"))) {
		let e = t.querySelectorAll(":scope > section");
		if (!e.length) continue;
		let n = t.getAttribute("data-state");
		for (let t of Array.from(e)) n ? t.setAttribute(z, n) : t.removeAttribute(z);
	}
	return !0;
}, H = (e) => {
	if (!e) return [];
	let t = e.parentElement;
	return He([...t?.tagName === "SECTION" ? B(t.getAttribute("data-state")) : B(e.getAttribute(z)), ...B(e.getAttribute("data-state"))]);
}, U = (e, t, n, { dispatch: r }) => {
	let i = H(n);
	for (let e of t.applied) i.includes(e) || t.host.classList.remove(e);
	for (let n of i) t.host.classList.add(n), r && !t.applied.includes(n) && e.dispatchEvent({ type: n });
	t.applied = i;
}, We = (e) => {
	e.warned || e.stacksRead || e.revealElement.querySelector(".scroll-page section[data-index-v]:not([data-index-v=\"0\"])") && (e.warned = !0, console.warn("[plugintoolkit]: addSlideStates was called after the deck had already switched to scroll view, so the states of stacks are unknown until it leaves scroll view once. Slides still get their own states. Call it from a plugin's init to avoid this."));
}, Ge = (e) => {
	let t = e.getRevealElement();
	if (!t) return null;
	let n = e.getViewportElement() ?? t, r = Ue(n), i = {
		revealElement: t,
		host: n,
		inScrollView: r,
		applied: [],
		regularStates: r ? [] : H(e.getCurrentSlide()),
		switching: !1,
		stacksRead: V(t),
		warned: !1
	};
	r && (We(i), U(e, i, e.getCurrentSlide(), { dispatch: !1 }));
	let a = () => {
		let r = Ue(n);
		r !== i.inScrollView && (i.inScrollView = r, r ? (We(i), i.applied = He([...i.applied, ...i.regularStates]), i.switching = !0, queueMicrotask(() => {
			i.switching = !1;
		}), U(e, i, e.getCurrentSlide(), { dispatch: !1 })) : (U(e, i, e.getCurrentSlide(), { dispatch: !1 }), i.applied = [], i.regularStates = H(e.getCurrentSlide()), i.stacksRead = V(t) || i.stacksRead));
	};
	return new MutationObserver(a).observe(n, {
		attributes: !0,
		attributeFilter: ["class"]
	}), e.on("ready", () => {
		a(), i.inScrollView ? U(e, i, e.getCurrentSlide(), { dispatch: !1 }) : (i.regularStates = H(e.getCurrentSlide()), i.stacksRead = V(t) || i.stacksRead);
	}), e.on("slidechanged", (t) => {
		a();
		let { currentSlide: n } = t, r = n ?? e.getCurrentSlide();
		i.inScrollView ? U(e, i, r, { dispatch: !i.switching }) : i.regularStates = H(r);
	}), i;
}, Ke = (e) => {
	if (e[ze]) return;
	let t = Ge(e);
	t && Ve(e, ze, t);
}, qe = /* @__PURE__ */ n({ addAnchor: () => $e }), Je = "data-toolkit-anchor", Ye = "--toolkit-anchor-height", Xe = (e) => e.getConfig(), Ze = (e) => Xe(e).view === "print" || /print-pdf/i.test(window.location.search) || document.documentElement.classList.contains("print-pdf"), Qe = (e, t, n, r, i) => {
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
}, et = /* @__PURE__ */ n({
	ENTRANCE_ATTRIBUTE: () => K,
	IN_EVENT: () => G,
	SHOWN_EVENT: () => W,
	announce: () => rt,
	markPending: () => Z,
	pendingAround: () => Q,
	reset: () => it,
	stateOf: () => Y,
	whenShown: () => $
}), W = "entranceshown", G = "entrancein", K = "data-entrance", q = {
	pending: 0,
	shown: 1,
	in: 2
}, J = Symbol.for("reveal.js-plugintoolkit.entranceTimers"), tt = () => typeof window.matchMedia == "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function Y(e) {
	let t = e.getAttribute(K);
	return t === "pending" || t === "shown" || t === "in" ? t : null;
}
function X(e, t) {
	if (e.setAttribute(K, t), t === "pending") return;
	let n = {
		element: e,
		state: t
	};
	e.dispatchEvent(new CustomEvent(t === "shown" ? W : G, {
		bubbles: !0,
		detail: n
	}));
}
function nt(e) {
	for (let t of e[J] ?? []) window.clearTimeout(t);
	delete e[J];
}
function Z(e) {
	nt(e), X(e, "pending");
}
function rt(e, t) {
	nt(e);
	let n = Math.max(0, t.delay ?? 0), r = Math.max(0, t.duration), i = Number.parseFloat(e.dataset.entranceAt ?? ""), a = Number.isFinite(i) ? Math.min(1, Math.max(0, i)) : .5;
	X(e, "pending"), e[J] = [window.setTimeout(() => X(e, "shown"), n + r * a), window.setTimeout(() => {
		Y(e) === "pending" && X(e, "shown"), X(e, "in"), delete e[J];
	}, n + r)];
}
function it(e) {
	Z(e);
}
function Q(e, t = "shown") {
	let n = [];
	for (let r = e; r && r.tagName !== "SECTION"; r = r.parentElement) {
		let e = Y(r);
		e && q[e] < q[t] && n.push(r);
	}
	return n;
}
function $(e, t = "shown", n) {
	if (n?.aborted) return Promise.resolve(!1);
	if (tt()) return Promise.resolve(!0);
	let r = Q(e, t);
	return r.length ? new Promise((i) => {
		let a = () => {
			Q(e, t).length || (s(), i(!0));
		}, o = () => {
			s(), i(!1);
		}, s = () => {
			for (let e of r) e.removeEventListener(W, a), e.removeEventListener(G, a);
			n?.removeEventListener("abort", o);
		};
		for (let e of r) e.addEventListener(W, a), e.addEventListener(G, a);
		n?.addEventListener("abort", o);
	}) : Promise.resolve(!0);
}
//#endregion
//#region src/utils/plugin-tools/index.ts
var at = /* @__PURE__ */ n({
	addAnchor: () => $e,
	addDirectionEvents: () => b,
	addMoreDirectionEvents: () => x,
	addScrollModeEvents: () => S,
	addSlideStates: () => Ke,
	addThemeColor: () => Le,
	announce: () => rt,
	copyDataAttributes: () => j,
	createNode: () => M,
	getSectionType: () => O,
	getStack: () => D,
	isHorizontal: () => E,
	isJSON: () => k,
	isSection: () => C,
	isStack: () => w,
	isVertical: () => T,
	markPending: () => Z,
	pendingAround: () => Q,
	reset: () => it,
	sanitizeText: () => N,
	toJSONString: () => A,
	whenShown: () => $
});
//#endregion
export { ne as PluginBase, h as checkCssImported, Se as configTools, fe as createPluginDebug, Ce as domTools, et as entranceTools, ve as eventTools, u as findPluginSource, d as hasResolvableSource, ae as isCssImported, ce as isThemeApplied, _e as pluginCSS, de as pluginDebug, at as pluginTools, qe as positionTools, be as sectionTools, Re as stateTools, we as textTools, Te as themeTools, _ as warnOnce, m as whenCssImported, se as whenThemeApplied };
