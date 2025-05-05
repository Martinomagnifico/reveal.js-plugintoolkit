var T = Object.defineProperty;
var L = (n, e, t) => e in n ? T(n, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[e] = t;
var c = (n, e, t) => L(n, typeof e != "symbol" ? e + "" : e, t);
function O(n) {
  return n && n.__esModule && Object.prototype.hasOwnProperty.call(n, "default") ? n.default : n;
}
var C, v;
function x() {
  if (v) return C;
  v = 1;
  var n = function(l) {
    return e(l) && !t(l);
  };
  function e(i) {
    return !!i && typeof i == "object";
  }
  function t(i) {
    var l = Object.prototype.toString.call(i);
    return l === "[object RegExp]" || l === "[object Date]" || a(i);
  }
  var o = typeof Symbol == "function" && Symbol.for, r = o ? Symbol.for("react.element") : 60103;
  function a(i) {
    return i.$$typeof === r;
  }
  function f(i) {
    return Array.isArray(i) ? [] : {};
  }
  function g(i, l) {
    return l.clone !== !1 && l.isMergeableObject(i) ? b(f(i), i, l) : i;
  }
  function d(i, l, s) {
    return i.concat(l).map(function(p) {
      return g(p, s);
    });
  }
  function h(i, l) {
    if (!l.customMerge)
      return b;
    var s = l.customMerge(i);
    return typeof s == "function" ? s : b;
  }
  function m(i) {
    return Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(i).filter(function(l) {
      return Object.propertyIsEnumerable.call(i, l);
    }) : [];
  }
  function $(i) {
    return Object.keys(i).concat(m(i));
  }
  function E(i, l) {
    try {
      return l in i;
    } catch {
      return !1;
    }
  }
  function j(i, l) {
    return E(i, l) && !(Object.hasOwnProperty.call(i, l) && Object.propertyIsEnumerable.call(i, l));
  }
  function I(i, l, s) {
    var p = {};
    return s.isMergeableObject(i) && $(i).forEach(function(u) {
      p[u] = g(i[u], s);
    }), $(l).forEach(function(u) {
      j(i, u) || (E(i, u) && s.isMergeableObject(l[u]) ? p[u] = h(u, s)(i[u], l[u], s) : p[u] = g(l[u], s));
    }), p;
  }
  function b(i, l, s) {
    s = s || {}, s.arrayMerge = s.arrayMerge || d, s.isMergeableObject = s.isMergeableObject || n, s.cloneUnlessOtherwiseSpecified = g;
    var p = Array.isArray(l), u = Array.isArray(i), D = p === u;
    return D ? p ? s.arrayMerge(i, l, s) : I(i, l, s) : g(l, s);
  }
  b.all = function(l, s) {
    if (!Array.isArray(l))
      throw new Error("first argument should be an array");
    return l.reduce(function(p, u) {
      return b(p, u, s);
    }, {});
  };
  var P = b;
  return C = P, C;
}
var _ = x();
const z = /* @__PURE__ */ O(_), B = () => {
  const n = typeof window < "u", e = typeof document < "u", t = n && typeof location < "u" && /localhost|127\.0\.0\.1/.test(location.hostname);
  let o = !1;
  try {
    o = new Function('return typeof module !== "undefined" && !!module.hot')();
  } catch {
  }
  let r = !1;
  try {
    r = new Function('return typeof import.meta !== "undefined" && typeof import.meta.env !== "undefined" && import.meta.env.DEV === true')();
  } catch {
  }
  const a = n && typeof navigator < "u" && /vite|localhost|127\.0\.0\.1/.test(location.origin) && /AppleWebKit|Chrome|Vite/.test(navigator.userAgent), f = e && !!document.querySelector('script[type="module"]');
  let g = !1;
  try {
    g = new Function('return typeof process !== "undefined" && process.env && (process.env.ROLLUP_WATCH === "true" || process.env.NODE_ENV === "development")')();
  } catch {
  }
  let d = !1;
  try {
    d = new Function('return typeof define === "function" && !!define.amd')();
  } catch {
  }
  return {
    isDevServer: t,
    isWebpackHMR: o,
    isVite: r,
    isVitePreview: a,
    hasModuleScripts: f,
    isModuleBundler: g,
    isAMD: d,
    isBundlerEnvironment: o || r || a || f || g || d || t
  };
};
class F {
  // Create a new plugin instance
  constructor(e, t, o) {
    c(this, "defaultConfig");
    c(this, "pluginInit");
    c(this, "pluginId");
    c(this, "mergedConfig", null);
    c(this, "userConfigData", null);
    /** Public data storage for plugin state */
    c(this, "data", {});
    // Gets information about the current JavaScript environment
    c(this, "getEnvironmentInfo", () => B());
    typeof e == "string" ? (this.pluginId = e, this.pluginInit = t, this.defaultConfig = o || {}) : (this.pluginId = e.id, this.pluginInit = e.init, this.defaultConfig = e.defaultConfig || {});
  }
  // Initialize plugin configuration by merging default and user settings
  initializeConfig(e) {
    const t = this.defaultConfig, r = e.getConfig()[this.pluginId] || {};
    this.userConfigData = r, this.mergedConfig = z(t, r, {
      arrayMerge: (a, f) => f,
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
      init: (o) => this.init(o),
      getConfig: () => this.getCurrentConfig(),
      getData: () => this.getData(),
      ...e
    };
  }
}
const R = (n) => {
  const e = document.querySelector(
    `script[src$="${n}.js"], script[src$="${n}.min.js"], script[src$="${n}.mjs"]`
  );
  if (e != null && e.src) {
    const t = e.getAttribute("src") || "", o = t.lastIndexOf("/");
    if (o !== -1)
      return t.substring(0, o + 1);
  }
  try {
    if (typeof import.meta < "u" && import.meta.url)
      return import.meta.url.slice(0, import.meta.url.lastIndexOf("/") + 1);
  } catch {
  }
  return `plugin/${n}/`;
}, A = "data-css-id", U = (n, e) => new Promise((t, o) => {
  const r = document.createElement("link");
  r.rel = "stylesheet", r.href = e, r.setAttribute(A, n);
  const a = setTimeout(() => {
    r.parentNode && r.parentNode.removeChild(r), o(new Error(`[${n}] Timeout loading CSS from: ${e}`));
  }, 5e3);
  r.onload = () => {
    clearTimeout(a), t();
  }, r.onerror = () => {
    clearTimeout(a), r.parentNode && r.parentNode.removeChild(r), o(new Error(`[${n}] Failed to load CSS from: ${e}`));
  }, document.head.appendChild(r);
}), M = (n) => document.querySelectorAll(`[${A}="${n}"]`).length > 0, V = (n) => new Promise((e) => {
  if (t())
    return e(!0);
  setTimeout(() => {
    e(t());
  }, 50);
  function t() {
    if (M(n)) return !0;
    try {
      return window.getComputedStyle(document.documentElement).getPropertyValue(`--cssimported-${n}`).trim() !== "";
    } catch {
      return !1;
    }
  }
}), w = async (n) => {
  const {
    id: e,
    cssautoload: t = !0,
    csspath: o = "",
    debug: r = !1
  } = n;
  if (t === !1 || o === !1) return;
  if (M(e)) {
    r && console.log(`[${e}] CSS already loaded, skipping`);
    return;
  }
  const a = [];
  typeof o == "string" && o.trim() !== "" && a.push(o);
  const f = R(e);
  if (f) {
    const d = `${f}${e}.css`;
    a.push(d);
  }
  const g = `plugin/${e}/${e}.css`;
  a.push(g);
  for (const d of a)
    try {
      await U(e, d);
      let h = "CSS";
      o && d === o ? h = "user-specified CSS" : f && d === `${f}${e}.css` ? h = "CSS (auto-detected from script location)" : h = "CSS (standard fallback)", r && console.log(`[${e}] ${h} loaded successfully from: ${d}`);
      return;
    } catch {
      r && console.log(`[${e}] Failed to load CSS from: ${d}`);
    }
  console.warn(`[${e}] Could not load CSS from any location`);
};
async function q(n, e) {
  if ("getEnvironmentInfo" in n && e) {
    const t = n, o = t.getEnvironmentInfo();
    if (await V(t.pluginId)) {
      e.debug && console.log(`[${t.pluginId}] CSS already imported, skipping`);
      return;
    }
    if ("cssautoload" in t.userConfig ? !!e.cssautoload : !o.isBundlerEnvironment)
      return w({
        id: t.pluginId,
        cssautoload: !0,
        csspath: e.csspath,
        debug: e.debug
      });
    o.isBundlerEnvironment && console.warn(`[${t.pluginId}] CSS autoloading is disabled in bundler environments. Please import the CSS manually, using import.`);
    return;
  }
  return w(n);
}
class N {
  constructor() {
    // Flag to enable/disable all debugging output
    c(this, "debugMode", !1);
    // Label to prefix all debug messages with
    c(this, "label", "DEBUG");
    // Tracks the current depth of console groups for proper formatting
    c(this, "groupDepth", 0);
    // Creates a new console group and tracks the group depth. 
    // Groups will always display the label prefix in their header.
    c(this, "group", (...e) => {
      this.debugLog("group", ...e), this.groupDepth++;
    });
    // Creates a new collapsed console group and tracks the group depth.
    c(this, "groupCollapsed", (...e) => {
      this.debugLog("groupCollapsed", ...e), this.groupDepth++;
    });
    // Ends the current console group and updates the group depth tracker.
    c(this, "groupEnd", () => {
      this.groupDepth > 0 && (this.groupDepth--, this.debugLog("groupEnd"));
    });
    // Formats and logs an error message with the debug label. 
    // Error messages are always shown, even when debug mode is disabled.
    c(this, "error", (...e) => {
      const t = this.debugMode;
      this.debugMode = !0, this.formatAndLog(console.error, e), this.debugMode = t;
    });
    // Displays a table in the console with the pluginDebug label.
    // Special implementation for console.table to handle tabular data properly.
    // @param messageOrData - Either a message string or the tabular data
    // @param propertiesOrData - Either property names or tabular data (if first param was message)
    // @param optionalProperties - Optional property names (if first param was message)
    c(this, "table", (e, t, o) => {
      if (this.debugMode)
        try {
          typeof e == "string" && t !== void 0 && typeof t != "string" ? (this.groupDepth === 0 ? console.log(`[${this.label}]: ${e}`) : console.log(e), o ? console.table(t, o) : console.table(t)) : (this.groupDepth === 0 && console.log(`[${this.label}]: Table data`), typeof t == "object" && Array.isArray(t) ? console.table(e, t) : console.table(e));
        } catch (r) {
          console.error(`[${this.label}]: Error showing table:`, r), console.log(`[${this.label}]: Raw data:`, e);
        }
    });
    // Helper method that formats and logs messages with the pluginDebug label.
    // @param logMethod - The console method to use for logging
    // @param args - Arguments to pass to the console method
    c(this, "formatAndLog", (e, t) => {
      if (this.debugMode)
        try {
          this.groupDepth > 0 ? e.call(console, ...t) : t.length > 0 && typeof t[0] == "string" ? e.call(console, `[${this.label}]: ${t[0]}`, ...t.slice(1)) : e.call(console, `[${this.label}]:`, ...t);
        } catch (o) {
          console.error(`[${this.label}]: Error in logging:`, o), console.log(`[${this.label}]: Original log data:`, ...t);
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
    const o = console[e];
    if (!this.debugMode && e !== "error" || typeof o != "function") return;
    const r = o;
    if (e === "group" || e === "groupCollapsed") {
      t.length > 0 && typeof t[0] == "string" ? r.call(console, `[${this.label}]: ${t[0]}`, ...t.slice(1)) : r.call(console, `[${this.label}]:`, ...t);
      return;
    }
    if (e === "groupEnd") {
      r.call(console);
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
    this.groupDepth > 0 ? r.call(console, ...t) : t.length > 0 && typeof t[0] == "string" ? r.call(console, `[${this.label}]: ${t[0]}`, ...t.slice(1)) : r.call(console, `[${this.label}]:`, ...t);
  }
}
const k = (n) => new Proxy(n, {
  get: (e, t) => {
    if (t in e)
      return e[t];
    const o = t.toString();
    if (typeof console[o] == "function")
      return (...r) => {
        e.debugLog(o, ...r);
      };
  }
}), y = k(new N()), W = {
  demoOption: "default value",
  cssautoload: !0,
  csspath: "",
  debug: !1
};
class S {
  constructor(e, t) {
    c(this, "deck");
    c(this, "options");
    this.deck = e, this.options = t, y.log("Demo plugin initialized with options:", t);
  }
  // Example method to demonstrate functionality
  initialize() {
    y.log("Demo plugin initialized successfully");
    const e = document.createElement("div");
    e.className = "demo-plugin-indicator", e.textContent = "Demo Plugin Active", document.body.appendChild(e), y.log("Indicator element added");
  }
  static create(e, t) {
    const o = new S(e, t);
    return o.initialize(), o;
  }
}
const G = async (n, e, t) => {
  y.initialize(t.debug, "demo-plugin");
  const o = n.getEnvironmentInfo();
  y.log("Environment:", o), await q(n, t), await S.create(e, t);
}, K = () => new F("demo-plugin", G, W).createInterface();
export {
  K as default
};
