var I = Object.defineProperty;
var P = (r, e, t) => e in r ? I(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : r[e] = t;
var c = (r, e, t) => P(r, typeof e != "symbol" ? e + "" : e, t);
function T(r) {
  return r && r.__esModule && Object.prototype.hasOwnProperty.call(r, "default") ? r.default : r;
}
var C, w;
function L() {
  if (w) return C;
  w = 1;
  var r = function(l) {
    return e(l) && !t(l);
  };
  function e(n) {
    return !!n && typeof n == "object";
  }
  function t(n) {
    var l = Object.prototype.toString.call(n);
    return l === "[object RegExp]" || l === "[object Date]" || a(n);
  }
  var i = typeof Symbol == "function" && Symbol.for, o = i ? Symbol.for("react.element") : 60103;
  function a(n) {
    return n.$$typeof === o;
  }
  function d(n) {
    return Array.isArray(n) ? [] : {};
  }
  function g(n, l) {
    return l.clone !== !1 && l.isMergeableObject(n) ? b(d(n), n, l) : n;
  }
  function f(n, l, s) {
    return n.concat(l).map(function(h) {
      return g(h, s);
    });
  }
  function p(n, l) {
    if (!l.customMerge)
      return b;
    var s = l.customMerge(n);
    return typeof s == "function" ? s : b;
  }
  function m(n) {
    return Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(n).filter(function(l) {
      return Object.propertyIsEnumerable.call(n, l);
    }) : [];
  }
  function $(n) {
    return Object.keys(n).concat(m(n));
  }
  function v(n, l) {
    try {
      return l in n;
    } catch {
      return !1;
    }
  }
  function M(n, l) {
    return v(n, l) && !(Object.hasOwnProperty.call(n, l) && Object.propertyIsEnumerable.call(n, l));
  }
  function j(n, l, s) {
    var h = {};
    return s.isMergeableObject(n) && $(n).forEach(function(u) {
      h[u] = g(n[u], s);
    }), $(l).forEach(function(u) {
      M(n, u) || (v(n, u) && s.isMergeableObject(l[u]) ? h[u] = p(u, s)(n[u], l[u], s) : h[u] = g(l[u], s));
    }), h;
  }
  function b(n, l, s) {
    s = s || {}, s.arrayMerge = s.arrayMerge || f, s.isMergeableObject = s.isMergeableObject || r, s.cloneUnlessOtherwiseSpecified = g;
    var h = Array.isArray(l), u = Array.isArray(n), D = h === u;
    return D ? h ? s.arrayMerge(n, l, s) : j(n, l, s) : g(l, s);
  }
  b.all = function(l, s) {
    if (!Array.isArray(l))
      throw new Error("first argument should be an array");
    return l.reduce(function(h, u) {
      return b(h, u, s);
    }, {});
  };
  var A = b;
  return C = A, C;
}
var O = L();
const x = /* @__PURE__ */ T(O), _ = () => {
  const r = typeof window < "u", e = typeof document < "u", t = r && typeof location < "u" && /localhost|127\.0\.0\.1/.test(location.hostname);
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
  const a = r && typeof navigator < "u" && /vite|localhost|127\.0\.0\.1/.test(location.origin) && /AppleWebKit|Chrome|Vite/.test(navigator.userAgent), d = e && !!document.querySelector('script[type="module"]');
  let g = !1;
  try {
    g = new Function('return typeof process !== "undefined" && process.env && (process.env.ROLLUP_WATCH === "true" || process.env.NODE_ENV === "development")')();
  } catch {
  }
  let f = !1;
  try {
    f = new Function('return typeof define === "function" && !!define.amd')();
  } catch {
  }
  return {
    isDevServer: t,
    isWebpackHMR: i,
    isVite: o,
    isVitePreview: a,
    hasModuleScripts: d,
    isModuleBundler: g,
    isAMD: f,
    isBundlerEnvironment: i || o || a || d || g || f || t
  };
};
class z {
  // Create a new plugin instance
  constructor(e, t, i) {
    c(this, "defaultConfig");
    c(this, "pluginInit");
    c(this, "pluginId");
    c(this, "mergedConfig", null);
    c(this, "userConfigData", null);
    /** Public data storage for plugin state */
    c(this, "data", {});
    // Gets information about the current JavaScript environment
    c(this, "getEnvironmentInfo", () => _());
    typeof e == "string" ? (this.pluginId = e, this.pluginInit = t, this.defaultConfig = i || {}) : (this.pluginId = e.id, this.pluginInit = e.init, this.defaultConfig = e.defaultConfig || {});
  }
  // Initialize plugin configuration by merging default and user settings
  initializeConfig(e) {
    const t = this.defaultConfig, o = e.getConfig()[this.pluginId] || {};
    this.userConfigData = o, this.mergedConfig = x(t, o, {
      arrayMerge: (a, d) => d,
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
const F = (r) => {
  const e = document.querySelector(
    `script[src$="${r}.js"], script[src$="${r}.min.js"], script[src$="${r}.mjs"]`
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
  return `plugin/${r}/`;
}, E = "data-css-id", R = (r, e) => new Promise((t, i) => {
  const o = document.createElement("link");
  o.rel = "stylesheet", o.href = e, o.setAttribute(E, r);
  const a = setTimeout(() => {
    o.parentNode && o.parentNode.removeChild(o), i(new Error(`[${r}] Timeout loading CSS from: ${e}`));
  }, 5e3);
  o.onload = () => {
    clearTimeout(a), t();
  }, o.onerror = () => {
    clearTimeout(a), o.parentNode && o.parentNode.removeChild(o), i(new Error(`[${r}] Failed to load CSS from: ${e}`));
  }, document.head.appendChild(o);
}), U = (r) => document.querySelectorAll(`[${E}="${r}"]`).length > 0, B = async (r) => {
  const {
    id: e,
    cssautoload: t = !0,
    csspath: i = "",
    debug: o = !1
  } = r;
  if (t === !1 || i === !1) return;
  if (U(e)) {
    o && console.log(`[${e}] CSS already loaded, skipping`);
    return;
  }
  const a = [];
  typeof i == "string" && i.trim() !== "" && a.push(i);
  const d = F(e);
  if (d) {
    const f = `${d}${e}.css`;
    a.push(f);
  }
  const g = `plugin/${e}/${e}.css`;
  a.push(g);
  for (const f of a)
    try {
      await R(e, f);
      let p = "CSS";
      i && f === i ? p = "user-specified CSS" : d && f === `${d}${e}.css` ? p = "CSS (auto-detected from script location)" : p = "CSS (standard fallback)", o && console.log(`[${e}] ${p} loaded successfully from: ${f}`);
      return;
    } catch {
      o && console.log(`[${e}] Failed to load CSS from: ${f}`);
    }
  console.warn(`[${e}] Could not load CSS from any location`);
};
class V {
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
    c(this, "table", (e, t, i) => {
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
    c(this, "formatAndLog", (e, t) => {
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
const q = (r) => new Proxy(r, {
  get: (e, t) => {
    if (t in e)
      return e[t];
    const i = t.toString();
    if (typeof console[i] == "function")
      return (...o) => {
        e.debugLog(i, ...o);
      };
  }
}), y = q(new V()), N = {
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
    const i = new S(e, t);
    return i.initialize(), i;
  }
}
const W = async (r, e, t) => {
  y.initialize(t.debug, "demo-plugin");
  const i = r.getEnvironmentInfo();
  if (y.log("Environment:", i), t.cssautoload)
    try {
      await B({
        id: r.pluginId,
        cssautoload: t.cssautoload,
        csspath: t.csspath,
        debug: t.debug
      });
    } catch (o) {
      y.warn("CSS loading failed, but plugin will continue:", o);
    }
  await S.create(e, t);
}, H = () => new z("demo-plugin", W, N).createInterface();
export {
  H as default
};
