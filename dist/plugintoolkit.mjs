var T = Object.defineProperty;
var M = (n, e, t) => e in n ? T(n, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[e] = t;
var l = (n, e, t) => M(n, typeof e != "symbol" ? e + "" : e, t);
import A from "deepmerge";
const L = () => {
  const n = typeof window < "u", e = typeof document < "u", t = n && typeof location < "u" && /localhost|127\.0\.0\.1/.test(location.hostname);
  let i = !1;
  try {
    i = new Function('return typeof module !== "undefined" && !!module.hot')();
  } catch {
  }
  let o = !1;
  try {
    o = new Function('return typeof import.meta !== "undefined" && typeof import.meta.env !== "undefined" && import.meta.env.DEV === true')();
  } catch {
  }
  const r = n && typeof navigator < "u" && /vite|localhost|127\.0\.0\.1/.test(location.origin) && /AppleWebKit|Chrome|Vite/.test(navigator.userAgent), s = e && !!document.querySelector('script[type="module"]');
  let u = !1;
  try {
    u = new Function('return typeof process !== "undefined" && process.env && (process.env.ROLLUP_WATCH === "true" || process.env.NODE_ENV === "development")')();
  } catch {
  }
  let c = !1;
  try {
    c = new Function('return typeof define === "function" && !!define.amd')();
  } catch {
  }
  return {
    isDevServer: t,
    isWebpackHMR: i,
    isVite: o,
    isVitePreview: r,
    hasModuleScripts: s,
    isModuleBundler: u,
    isAMD: c,
    isBundlerEnvironment: i || o || r || s || u || c || t
  };
};
class z {
  // Create a new plugin instance
  constructor(e, t, i) {
    l(this, "defaultConfig");
    l(this, "pluginInit");
    l(this, "pluginId");
    l(this, "mergedConfig", null);
    l(this, "userConfigData", null);
    /** Public data storage for plugin state */
    l(this, "data", {});
    // Gets information about the current JavaScript environment
    l(this, "getEnvironmentInfo", () => L());
    typeof e == "string" ? (this.pluginId = e, this.pluginInit = t, this.defaultConfig = i || {}) : (this.pluginId = e.id, this.pluginInit = e.init, this.defaultConfig = e.defaultConfig || {});
  }
  // Initialize plugin configuration by merging default and user settings
  initializeConfig(e) {
    const t = this.defaultConfig, o = e.getConfig()[this.pluginId] || {};
    this.userConfigData = o, this.mergedConfig = A(t, o, {
      arrayMerge: (r, s) => s,
      clone: !0
    });
  }
  // Get the current plugin configuration
  getCurrentConfig() {
    if (!this.mergedConfig)
      throw new Error("Plugin configuration has not been initialized");
    return this.mergedConfig;
  }
  // Get plugin data if any exists
  getData() {
    return Object.keys(this.data).length > 0 ? this.data : void 0;
  }
  get userConfig() {
    return this.userConfigData || {};
  }
  // Initialize the plugin
  init(e) {
    if (this.initializeConfig(e), this.pluginInit)
      return this.pluginInit(this, e, this.getCurrentConfig());
  }
  // Create the plugin interface containing all exports
  createInterface(e = {}) {
    return {
      id: this.pluginId,
      init: (i) => this.init(i),
      getConfig: () => this.getCurrentConfig(),
      getData: () => this.getData(),
      ...e
    };
  }
}
const D = (n) => {
  const e = document.querySelector(
    `script[src$="${n}.js"], script[src$="${n}.min.js"], script[src$="${n}.mjs"]`
  );
  if (e != null && e.src) {
    const t = e.getAttribute("src") || "", i = t.lastIndexOf("/");
    if (i !== -1)
      return t.substring(0, i + 1);
  }
  try {
    if (typeof import.meta < "u" && import.meta.url)
      return import.meta.url.slice(0, import.meta.url.lastIndexOf("/") + 1);
  } catch {
  }
  return `plugin/${n}/`;
}, m = "data-css-id", P = (n, e) => new Promise((t, i) => {
  const o = document.createElement("link");
  o.rel = "stylesheet", o.href = e, o.setAttribute(m, n);
  const r = setTimeout(() => {
    o.parentNode && o.parentNode.removeChild(o), i(new Error(`[${n}] Timeout loading CSS from: ${e}`));
  }, 5e3);
  o.onload = () => {
    clearTimeout(r), t();
  }, o.onerror = () => {
    clearTimeout(r), o.parentNode && o.parentNode.removeChild(o), i(new Error(`[${n}] Failed to load CSS from: ${e}`));
  }, document.head.appendChild(o);
}), S = (n) => document.querySelectorAll(`[${m}="${n}"]`).length > 0, _ = (n) => new Promise((e) => {
  if (t())
    return e(!0);
  setTimeout(() => {
    e(t());
  }, 50);
  function t() {
    if (S(n)) return !0;
    try {
      return window.getComputedStyle(document.documentElement).getPropertyValue(`--cssimported-${n}`).trim() !== "";
    } catch {
      return !1;
    }
  }
}), b = async (n) => {
  const {
    id: e,
    cssautoload: t = !0,
    csspath: i = "",
    debug: o = !1
  } = n;
  if (t === !1 || i === !1) return;
  if (S(e)) {
    o && console.log(`[${e}] CSS already loaded, skipping`);
    return;
  }
  const r = [];
  typeof i == "string" && i.trim() !== "" && r.push(i);
  const s = D(e);
  if (s) {
    const c = `${s}${e}.css`;
    r.push(c);
  }
  const u = `plugin/${e}/${e}.css`;
  r.push(u);
  for (const c of r)
    try {
      await P(e, c);
      let a = "CSS";
      i && c === i ? a = "user-specified CSS" : s && c === `${s}${e}.css` ? a = "CSS (auto-detected from script location)" : a = "CSS (standard fallback)", o && console.log(`[${e}] ${a} loaded successfully from: ${c}`);
      return;
    } catch {
      o && console.log(`[${e}] Failed to load CSS from: ${c}`);
    }
  console.warn(`[${e}] Could not load CSS from any location`);
};
async function H(n, e) {
  if ("getEnvironmentInfo" in n && e) {
    const t = n, i = t.getEnvironmentInfo();
    if (await _(t.pluginId)) {
      e.debug && console.log(`[${t.pluginId}] CSS already imported, skipping`);
      return;
    }
    if ("cssautoload" in t.userConfig ? !!e.cssautoload : !i.isBundlerEnvironment)
      return b({
        id: t.pluginId,
        cssautoload: !0,
        csspath: e.csspath,
        debug: e.debug
      });
    i.isBundlerEnvironment && console.warn(`[${t.pluginId}] CSS autoloading is disabled in bundler environments. Please import the CSS manually, using import.`);
    return;
  }
  return b(n);
}
class x {
  constructor() {
    // Flag to enable/disable all debugging output
    l(this, "debugMode", !1);
    // Label to prefix all debug messages with
    l(this, "label", "DEBUG");
    // Tracks the current depth of console groups for proper formatting
    l(this, "groupDepth", 0);
    // Creates a new console group and tracks the group depth. 
    // Groups will always display the label prefix in their header.
    l(this, "group", (...e) => {
      this.debugLog("group", ...e), this.groupDepth++;
    });
    // Creates a new collapsed console group and tracks the group depth.
    l(this, "groupCollapsed", (...e) => {
      this.debugLog("groupCollapsed", ...e), this.groupDepth++;
    });
    // Ends the current console group and updates the group depth tracker.
    l(this, "groupEnd", () => {
      this.groupDepth > 0 && (this.groupDepth--, this.debugLog("groupEnd"));
    });
    // Formats and logs an error message with the debug label. 
    // Error messages are always shown, even when debug mode is disabled.
    l(this, "error", (...e) => {
      const t = this.debugMode;
      this.debugMode = !0, this.formatAndLog(console.error, e), this.debugMode = t;
    });
    // Displays a table in the console with the pluginDebug label.
    // Special implementation for console.table to handle tabular data properly.
    // @param messageOrData - Either a message string or the tabular data
    // @param propertiesOrData - Either property names or tabular data (if first param was message)
    // @param optionalProperties - Optional property names (if first param was message)
    l(this, "table", (e, t, i) => {
      if (this.debugMode)
        try {
          typeof e == "string" && t !== void 0 && typeof t != "string" ? (this.groupDepth === 0 ? console.log(`[${this.label}]: ${e}`) : console.log(e), i ? console.table(t, i) : console.table(t)) : (this.groupDepth === 0 && console.log(`[${this.label}]: Table data`), typeof t == "object" && Array.isArray(t) ? console.table(e, t) : console.table(e));
        } catch (o) {
          console.error(`[${this.label}]: Error showing table:`, o), console.log(`[${this.label}]: Raw data:`, e);
        }
    });
    // Helper method that formats and logs messages with the pluginDebug label.
    // @param logMethod - The console method to use for logging
    // @param args - Arguments to pass to the console method
    l(this, "formatAndLog", (e, t) => {
      if (this.debugMode)
        try {
          this.groupDepth > 0 ? e.call(console, ...t) : t.length > 0 && typeof t[0] == "string" ? e.call(console, `[${this.label}]: ${t[0]}`, ...t.slice(1)) : e.call(console, `[${this.label}]:`, ...t);
        } catch (i) {
          console.error(`[${this.label}]: Error in logging:`, i), console.log(`[${this.label}]: Original log data:`, ...t);
        }
    });
  }
  // Initializes the debug utility with custom settings.
  initialize(e, t = "DEBUG") {
    this.debugMode = e, this.label = t;
  }
  // Core method that handles calling console methods with proper formatting.
  // - Adds label prefix to messages outside of groups
  // - Skips label prefix for messages inside groups to avoid redundancy
  // - Always adds label prefix to group headers
  // - Error messages are always shown regardless of debug mode
  // @param methodName - Name of the console method to call
  // @param args - Arguments to pass to the console method
  debugLog(e, ...t) {
    const i = console[e];
    if (!this.debugMode && e !== "error" || typeof i != "function") return;
    const o = i;
    if (e === "group" || e === "groupCollapsed") {
      t.length > 0 && typeof t[0] == "string" ? o.call(console, `[${this.label}]: ${t[0]}`, ...t.slice(1)) : o.call(console, `[${this.label}]:`, ...t);
      return;
    }
    if (e === "groupEnd") {
      o.call(console);
      return;
    }
    if (e === "table") {
      t.length === 1 ? this.table(t[0]) : t.length === 2 ? typeof t[0] == "string" ? this.table(t[0], t[1]) : this.table(t[0], t[1]) : t.length >= 3 && this.table(
        t[0],
        t[1],
        t[2]
      );
      return;
    }
    this.groupDepth > 0 ? o.call(console, ...t) : t.length > 0 && typeof t[0] == "string" ? o.call(console, `[${this.label}]: ${t[0]}`, ...t.slice(1)) : o.call(console, `[${this.label}]:`, ...t);
  }
}
const k = (n) => new Proxy(n, {
  get: (e, t) => {
    if (t in e)
      return e[t];
    const i = t.toString();
    if (typeof console[i] == "function")
      return (...o) => {
        e.debugLog(i, ...o);
      };
  }
}), N = k(new x()), h = (n) => {
  let [e, t] = [0, 0];
  n.on("slidechanged", (i) => {
    const { indexh: o, indexv: r, previousSlide: s, currentSlide: u } = i;
    o !== e && n.dispatchEvent({
      type: "slidechanged-h",
      data: { previousSlide: s, currentSlide: u, indexh: o, indexv: r }
    }), r !== t && o === e && n.dispatchEvent({
      type: "slidechanged-v",
      data: { previousSlide: s, currentSlide: u, indexh: o, indexv: r }
    }), [e, t] = [o, r];
  });
}, y = h, C = (n) => {
  const e = n.getViewportElement();
  if (!e)
    return console.warn("[verticator]: Could not find viewport element"), () => {
    };
  const t = () => e.classList.contains("reveal-scroll");
  let i = t(), o = !0;
  const r = new MutationObserver(() => {
    if (!o) return;
    const s = t();
    if (s !== i) {
      const u = n.getCurrentSlide(), c = n.getIndices(), a = c.h, f = c.v, I = s ? "scrollmode-enter" : "scrollmode-exit";
      n.dispatchEvent({
        type: I,
        data: {
          currentSlide: u,
          previousSlide: null,
          indexh: a,
          indexv: f
          // We can add stuff here if needed. Plugin-authors, just ask!
        }
      }), i = s;
    }
  });
  return r.observe(e, { attributes: !0, attributeFilter: ["class"] }), () => {
    o = !1, r.disconnect();
  };
}, B = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  addDirectionEvents: h,
  addMoreDirectionEvents: y,
  addScrollModeEvents: C
}, Symbol.toStringTag, { value: "Module" }));
var v = /* @__PURE__ */ ((n) => (n.HORIZONTAL = "horizontal", n.STACK = "stack", n.VERTICAL = "vertical", n.INVALID = "invalid", n))(v || {});
const d = (n) => n instanceof HTMLElement && n.tagName === "SECTION", g = (n) => d(n) ? Array.from(n.children).some(
  (e) => e instanceof HTMLElement && e.tagName === "SECTION"
) : !1, p = (n) => d(n) ? n.parentElement instanceof HTMLElement && n.parentElement.tagName === "SECTION" : !1, $ = (n) => d(n) && !p(n) && !g(n), E = (n) => {
  if (!d(n)) return null;
  if (p(n)) {
    const e = n.parentElement;
    if (e instanceof HTMLElement && g(e))
      return e;
  }
  return null;
}, w = (n) => d(n) ? p(n) ? "vertical" : g(n) ? "stack" : "horizontal" : "invalid", F = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  SectionType: v,
  getSectionType: w,
  getStack: E,
  isHorizontal: $,
  isSection: d,
  isStack: g,
  isVertical: p
}, Symbol.toStringTag, { value: "Module" })), R = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  addDirectionEvents: h,
  addMoreDirectionEvents: y,
  addScrollModeEvents: C,
  getSectionType: w,
  getStack: E,
  isHorizontal: $,
  isSection: d,
  isStack: g,
  isVertical: p
}, Symbol.toStringTag, { value: "Module" }));
export {
  z as PluginBase,
  B as eventTools,
  _ as isCssImported,
  H as pluginCSS,
  N as pluginDebug,
  R as pluginTools,
  F as sectionTools
};
