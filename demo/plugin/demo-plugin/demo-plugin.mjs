var L = Object.defineProperty;
var x = (n, e, t) => e in n ? L(n, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[e] = t;
var u = (n, e, t) => x(n, typeof e != "symbol" ? e + "" : e, t);
function O(n) {
  return n && n.__esModule && Object.prototype.hasOwnProperty.call(n, "default") ? n.default : n;
}
var v, w;
function z() {
  if (w) return v;
  w = 1;
  var n = function(l) {
    return e(l) && !t(l);
  };
  function e(i) {
    return !!i && typeof i == "object";
  }
  function t(i) {
    var l = Object.prototype.toString.call(i);
    return l === "[object RegExp]" || l === "[object Date]" || c(i);
  }
  var r = typeof Symbol == "function" && Symbol.for, o = r ? Symbol.for("react.element") : 60103;
  function c(i) {
    return i.$$typeof === o;
  }
  function a(i) {
    return Array.isArray(i) ? [] : {};
  }
  function d(i, l) {
    return l.clone !== !1 && l.isMergeableObject(i) ? y(a(i), i, l) : i;
  }
  function f(i, l, s) {
    return i.concat(l).map(function(h) {
      return d(h, s);
    });
  }
  function p(i, l) {
    if (!l.customMerge)
      return y;
    var s = l.customMerge(i);
    return typeof s == "function" ? s : y;
  }
  function b(i) {
    return Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(i).filter(function(l) {
      return Object.propertyIsEnumerable.call(i, l);
    }) : [];
  }
  function S(i) {
    return Object.keys(i).concat(b(i));
  }
  function $(i, l) {
    try {
      return l in i;
    } catch {
      return !1;
    }
  }
  function j(i, l) {
    return $(i, l) && !(Object.hasOwnProperty.call(i, l) && Object.propertyIsEnumerable.call(i, l));
  }
  function T(i, l, s) {
    var h = {};
    return s.isMergeableObject(i) && S(i).forEach(function(g) {
      h[g] = d(i[g], s);
    }), S(l).forEach(function(g) {
      j(i, g) || ($(i, g) && s.isMergeableObject(l[g]) ? h[g] = p(g, s)(i[g], l[g], s) : h[g] = d(l[g], s));
    }), h;
  }
  function y(i, l, s) {
    s = s || {}, s.arrayMerge = s.arrayMerge || f, s.isMergeableObject = s.isMergeableObject || n, s.cloneUnlessOtherwiseSpecified = d;
    var h = Array.isArray(l), g = Array.isArray(i), P = h === g;
    return P ? h ? s.arrayMerge(i, l, s) : T(i, l, s) : d(l, s);
  }
  y.all = function(l, s) {
    if (!Array.isArray(l))
      throw new Error("first argument should be an array");
    return l.reduce(function(h, g) {
      return y(h, g, s);
    }, {});
  };
  var D = y;
  return v = D, v;
}
var N = z();
const _ = /* @__PURE__ */ O(N), V = () => {
  const n = typeof window < "u", e = typeof document < "u", t = n && typeof location < "u" && /localhost|127\.0\.0\.1/.test(location.hostname);
  let r = !1;
  try {
    r = new Function('return typeof module !== "undefined" && !!module.hot')();
  } catch {
  }
  let o = !1;
  try {
    o = new Function('return typeof import.meta !== "undefined" && typeof import.meta.env !== "undefined" && import.meta.env.DEV === true')();
  } catch {
  }
  const c = n && typeof navigator < "u" && /vite|localhost|127\.0\.0\.1/.test(location.origin) && /AppleWebKit|Chrome|Vite/.test(navigator.userAgent), a = e && !!document.querySelector('script[type="module"]');
  let d = !1;
  try {
    d = new Function('return typeof process !== "undefined" && process.env && (process.env.ROLLUP_WATCH === "true" || process.env.NODE_ENV === "development")')();
  } catch {
  }
  let f = !1;
  try {
    f = new Function('return typeof define === "function" && !!define.amd')();
  } catch {
  }
  return {
    isDevServer: t,
    isWebpackHMR: r,
    isVite: o,
    isVitePreview: c,
    hasModuleScripts: a,
    isModuleBundler: d,
    isAMD: f,
    isBundlerEnvironment: r || o || c || a || d || f || t
  };
};
class F {
  // Create a new plugin instance
  constructor(e, t, r) {
    u(this, "defaultConfig");
    u(this, "pluginInit");
    u(this, "pluginId");
    u(this, "mergedConfig", null);
    u(this, "userConfigData", null);
    /** Public data storage for plugin state */
    u(this, "data", {});
    // Gets information about the current JavaScript environment
    u(this, "getEnvironmentInfo", () => V());
    typeof e == "string" ? (this.pluginId = e, this.pluginInit = t, this.defaultConfig = r || {}) : (this.pluginId = e.id, this.pluginInit = e.init, this.defaultConfig = e.defaultConfig || {});
  }
  // Initialize plugin configuration by merging default and user settings
  initializeConfig(e) {
    const t = this.defaultConfig, o = e.getConfig()[this.pluginId] || {};
    this.userConfigData = o, this.mergedConfig = _(t, o, {
      arrayMerge: (c, a) => a,
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
      init: (r) => this.init(r),
      getConfig: () => this.getCurrentConfig(),
      getData: () => this.getData(),
      ...e
    };
  }
}
const B = (n) => {
  const e = document.querySelector(
    `script[src$="${n}.js"], script[src$="${n}.min.js"], script[src$="${n}.mjs"]`
  );
  if (e != null && e.src) {
    const t = e.getAttribute("src") || "", r = t.lastIndexOf("/");
    if (r !== -1)
      return t.substring(0, r + 1);
  }
  try {
    if (typeof import.meta < "u" && import.meta.url)
      return import.meta.url.slice(0, import.meta.url.lastIndexOf("/") + 1);
  } catch {
  }
  return `plugin/${n}/`;
}, A = "data-css-id", R = (n, e) => new Promise((t, r) => {
  const o = document.createElement("link");
  o.rel = "stylesheet", o.href = e, o.setAttribute(A, n);
  const c = setTimeout(() => {
    o.parentNode && o.parentNode.removeChild(o), r(new Error(`[${n}] Timeout loading CSS from: ${e}`));
  }, 5e3);
  o.onload = () => {
    clearTimeout(c), t();
  }, o.onerror = () => {
    clearTimeout(c), o.parentNode && o.parentNode.removeChild(o), r(new Error(`[${n}] Failed to load CSS from: ${e}`));
  }, document.head.appendChild(o);
}), I = (n) => document.querySelectorAll(`[${A}="${n}"]`).length > 0, k = (n) => new Promise((e) => {
  if (t())
    return e(!0);
  setTimeout(() => {
    e(t());
  }, 50);
  function t() {
    if (I(n)) return !0;
    try {
      return window.getComputedStyle(document.documentElement).getPropertyValue(`--cssimported-${n}`).trim() !== "";
    } catch {
      return !1;
    }
  }
}), M = async (n) => {
  const {
    id: e,
    cssautoload: t = !0,
    csspath: r = "",
    debug: o = !1
  } = n;
  if (t === !1 || r === !1) return;
  if (I(e)) {
    o && console.log(`[${e}] CSS already loaded, skipping`);
    return;
  }
  const c = [];
  typeof r == "string" && r.trim() !== "" && c.push(r);
  const a = B(e);
  if (a) {
    const f = `${a}${e}.css`;
    c.push(f);
  }
  const d = `plugin/${e}/${e}.css`;
  c.push(d);
  for (const f of c)
    try {
      await R(e, f);
      let p = "CSS";
      r && f === r ? p = "user-specified CSS" : a && f === `${a}${e}.css` ? p = "CSS (auto-detected from script location)" : p = "CSS (standard fallback)", o && console.log(`[${e}] ${p} loaded successfully from: ${f}`);
      return;
    } catch {
      o && console.log(`[${e}] Failed to load CSS from: ${f}`);
    }
  console.warn(`[${e}] Could not load CSS from any location`);
};
async function U(n, e) {
  if ("getEnvironmentInfo" in n && e) {
    const t = n, r = t.getEnvironmentInfo();
    if (await k(t.pluginId)) {
      e.debug && console.log(`[${t.pluginId}] CSS already imported, skipping`);
      return;
    }
    if ("cssautoload" in t.userConfig ? !!e.cssautoload : !r.isBundlerEnvironment)
      return M({
        id: t.pluginId,
        cssautoload: !0,
        csspath: e.csspath,
        debug: e.debug
      });
    r.isBundlerEnvironment && console.warn(`[${t.pluginId}] CSS autoloading is disabled in bundler environments. Please import the CSS manually, using import.`);
    return;
  }
  return M(n);
}
class H {
  constructor() {
    // Flag to enable/disable all debugging output
    u(this, "debugMode", !1);
    // Label to prefix all debug messages with
    u(this, "label", "DEBUG");
    // Tracks the current depth of console groups for proper formatting
    u(this, "groupDepth", 0);
    // Creates a new console group and tracks the group depth. 
    // Groups will always display the label prefix in their header.
    u(this, "group", (...e) => {
      this.debugLog("group", ...e), this.groupDepth++;
    });
    // Creates a new collapsed console group and tracks the group depth.
    u(this, "groupCollapsed", (...e) => {
      this.debugLog("groupCollapsed", ...e), this.groupDepth++;
    });
    // Ends the current console group and updates the group depth tracker.
    u(this, "groupEnd", () => {
      this.groupDepth > 0 && (this.groupDepth--, this.debugLog("groupEnd"));
    });
    // Formats and logs an error message with the debug label. 
    // Error messages are always shown, even when debug mode is disabled.
    u(this, "error", (...e) => {
      const t = this.debugMode;
      this.debugMode = !0, this.formatAndLog(console.error, e), this.debugMode = t;
    });
    // Displays a table in the console with the pluginDebug label.
    // Special implementation for console.table to handle tabular data properly.
    // @param messageOrData - Either a message string or the tabular data
    // @param propertiesOrData - Either property names or tabular data (if first param was message)
    // @param optionalProperties - Optional property names (if first param was message)
    u(this, "table", (e, t, r) => {
      if (this.debugMode)
        try {
          typeof e == "string" && t !== void 0 && typeof t != "string" ? (this.groupDepth === 0 ? console.log(`[${this.label}]: ${e}`) : console.log(e), r ? console.table(t, r) : console.table(t)) : (this.groupDepth === 0 && console.log(`[${this.label}]: Table data`), typeof t == "object" && Array.isArray(t) ? console.table(e, t) : console.table(e));
        } catch (o) {
          console.error(`[${this.label}]: Error showing table:`, o), console.log(`[${this.label}]: Raw data:`, e);
        }
    });
    // Helper method that formats and logs messages with the pluginDebug label.
    // @param logMethod - The console method to use for logging
    // @param args - Arguments to pass to the console method
    u(this, "formatAndLog", (e, t) => {
      if (this.debugMode)
        try {
          this.groupDepth > 0 ? e.call(console, ...t) : t.length > 0 && typeof t[0] == "string" ? e.call(console, `[${this.label}]: ${t[0]}`, ...t.slice(1)) : e.call(console, `[${this.label}]:`, ...t);
        } catch (r) {
          console.error(`[${this.label}]: Error in logging:`, r), console.log(`[${this.label}]: Original log data:`, ...t);
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
    const r = console[e];
    if (!this.debugMode && e !== "error" || typeof r != "function") return;
    const o = r;
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
const q = (n) => new Proxy(n, {
  get: (e, t) => {
    if (t in e)
      return e[t];
    const r = t.toString();
    if (typeof console[r] == "function")
      return (...o) => {
        e.debugLog(r, ...o);
      };
  }
}), m = q(new H()), W = (n) => {
  let [e, t] = [0, 0];
  n.on("slidechanged", (r) => {
    const { indexh: o, indexv: c, previousSlide: a, currentSlide: d } = r;
    o !== e && n.dispatchEvent({
      type: "slidechanged-h",
      data: { previousSlide: a, currentSlide: d, indexh: o, indexv: c }
    }), c !== t && o === e && n.dispatchEvent({
      type: "slidechanged-v",
      data: { previousSlide: a, currentSlide: d, indexh: o, indexv: c }
    }), [e, t] = [o, c];
  });
}, G = W, K = (n) => {
  const e = n.getViewportElement();
  if (!e)
    return console.warn("[verticator]: Could not find viewport element"), () => {
    };
  const t = () => e.classList.contains("reveal-scroll");
  let r = t(), o = !0;
  const c = new MutationObserver(() => {
    if (!o) return;
    const a = t();
    if (a !== r) {
      const d = n.getCurrentSlide(), f = n.getIndices(), p = f.h, b = f.v, S = a ? "scrollmode-enter" : "scrollmode-exit";
      n.dispatchEvent({
        type: S,
        data: {
          currentSlide: d,
          previousSlide: null,
          indexh: p,
          indexv: b
          // We can add stuff here if needed. Plugin-authors, just ask!
        }
      }), r = a;
    }
  });
  return c.observe(e, { attributes: !0, attributeFilter: ["class"] }), () => {
    o = !1, c.disconnect();
  };
}, C = (n) => n instanceof HTMLElement && n.tagName === "SECTION", Y = (n) => C(n) ? Array.from(n.children).some(
  (e) => e instanceof HTMLElement && e.tagName === "SECTION"
) : !1, J = (n) => C(n) ? n.parentElement instanceof HTMLElement && n.parentElement.tagName === "SECTION" : !1, Q = (n) => C(n) ? J(n) ? "vertical" : Y(n) ? "stack" : "horizontal" : "invalid", X = {
  demoOption: "default value",
  cssautoload: !0,
  csspath: "",
  debug: !1
};
class E {
  constructor(e, t) {
    u(this, "deck");
    u(this, "options");
    u(this, "currentSlide", null);
    this.deck = e, this.options = t, m.log("Demo plugin initialized with options:", t);
  }
  // Example method to demonstrate functionality
  initialize() {
    m.log("Demo plugin initialized successfully");
    const e = document.createElement("div");
    e.className = "demo-plugin-indicator", e.textContent = "Demo Plugin Active", document.body.appendChild(e), m.log("Indicator element added"), G(this.deck), K(this.deck), this.deck.on("slidechanged-h", (t) => {
      const r = t;
      if (r.currentSlide !== this.currentSlide) {
        m.log("Moved horizontally", r);
        const o = Q(r.currentSlide);
        m.log("Slide type:", o), this.currentSlide = r.currentSlide;
      }
    }), this.deck.on("slidechanged-v", (t) => {
      const r = t;
      r.currentSlide !== this.currentSlide && (m.log("Moved vertically", r), this.currentSlide = r.currentSlide);
    }), this.deck.on("scrollmode-enter", (t) => {
      const r = t;
      m.log("Scroll mode enter", r);
    }), this.deck.on("scrollmode-exit", (t) => {
      const r = t;
      m.log("Scroll mode exit", r);
    });
  }
  static create(e, t) {
    const r = new E(e, t);
    return r.initialize(), r;
  }
}
const Z = async (n, e, t) => {
  m.initialize(t.debug, "demo-plugin");
  const r = n.getEnvironmentInfo();
  m.log("Environment:", r), await U(n, t), await E.create(e, t);
}, te = () => new F("demo-plugin", Z, X).createInterface();
export {
  te as default
};
