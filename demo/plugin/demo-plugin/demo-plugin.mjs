var P = Object.defineProperty;
var T = (o, e, t) => e in o ? P(o, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : o[e] = t;
var c = (o, e, t) => T(o, typeof e != "symbol" ? e + "" : e, t);
function D(o) {
  return o && o.__esModule && Object.prototype.hasOwnProperty.call(o, "default") ? o.default : o;
}
var m, j;
function L() {
  if (j) return m;
  j = 1;
  var o = function(r) {
    return e(r) && !t(r);
  };
  function e(n) {
    return !!n && typeof n == "object";
  }
  function t(n) {
    var r = Object.prototype.toString.call(n);
    return r === "[object RegExp]" || r === "[object Date]" || f(n);
  }
  var i = typeof Symbol == "function" && Symbol.for, l = i ? Symbol.for("react.element") : 60103;
  function f(n) {
    return n.$$typeof === l;
  }
  function g(n) {
    return Array.isArray(n) ? [] : {};
  }
  function h(n, r) {
    return r.clone !== !1 && r.isMergeableObject(n) ? p(g(n), n, r) : n;
  }
  function d(n, r, s) {
    return n.concat(r).map(function(a) {
      return h(a, s);
    });
  }
  function b(n, r) {
    if (!r.customMerge)
      return p;
    var s = r.customMerge(n);
    return typeof s == "function" ? s : p;
  }
  function M(n) {
    return Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(n).filter(function(r) {
      return Object.propertyIsEnumerable.call(n, r);
    }) : [];
  }
  function $(n) {
    return Object.keys(n).concat(M(n));
  }
  function S(n, r) {
    try {
      return r in n;
    } catch {
      return !1;
    }
  }
  function E(n, r) {
    return S(n, r) && !(Object.hasOwnProperty.call(n, r) && Object.propertyIsEnumerable.call(n, r));
  }
  function A(n, r, s) {
    var a = {};
    return s.isMergeableObject(n) && $(n).forEach(function(u) {
      a[u] = h(n[u], s);
    }), $(r).forEach(function(u) {
      E(n, u) || (S(n, u) && s.isMergeableObject(r[u]) ? a[u] = b(u, s)(n[u], r[u], s) : a[u] = h(r[u], s));
    }), a;
  }
  function p(n, r, s) {
    s = s || {}, s.arrayMerge = s.arrayMerge || d, s.isMergeableObject = s.isMergeableObject || o, s.cloneUnlessOtherwiseSpecified = h;
    var a = Array.isArray(r), u = Array.isArray(n), v = a === u;
    return v ? a ? s.arrayMerge(n, r, s) : A(n, r, s) : h(r, s);
  }
  p.all = function(r, s) {
    if (!Array.isArray(r))
      throw new Error("first argument should be an array");
    return r.reduce(function(a, u) {
      return p(a, u, s);
    }, {});
  };
  var I = p;
  return m = I, m;
}
var O = L();
const x = /* @__PURE__ */ D(O);
class z {
  /**
   * Create a new plugin instance
   */
  constructor(e, t, i) {
    c(this, "defaultConfig");
    c(this, "pluginInit");
    c(this, "pluginId");
    c(this, "mergedConfig", null);
    /** Public data storage for plugin state */
    c(this, "data", {});
    typeof e == "string" ? (this.pluginId = e, this.pluginInit = t, this.defaultConfig = i || {}) : (this.pluginId = e.id, this.pluginInit = e.init, this.defaultConfig = e.defaultConfig || {});
  }
  /**
   * Initialize plugin configuration by merging default and user settings
   */
  initializeConfig(e) {
    const t = this.defaultConfig, l = e.getConfig()[this.pluginId] || {};
    this.mergedConfig = x(t, l, {
      arrayMerge: (f, g) => g,
      clone: !0
    });
  }
  /**
   * Get the current plugin configuration
   */
  getCurrentConfig() {
    if (!this.mergedConfig)
      throw new Error("Plugin configuration has not been initialized");
    return this.mergedConfig;
  }
  /**
   * Get plugin data if any exists
   */
  getData() {
    return Object.keys(this.data).length > 0 ? this.data : void 0;
  }
  /**
   * Initialize the plugin
   */
  init(e) {
    if (this.initializeConfig(e), this.pluginInit)
      return this.pluginInit(this, e, this.getCurrentConfig());
  }
  /**
   * Create the plugin interface containing all exports
   */
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
const _ = (o) => {
  const e = document.querySelector(
    `script[src$="${o}.js"], script[src$="${o}.min.js"], script[src$="${o}.mjs"]`
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
  return `plugin/${o}/`;
}, w = "data-css-id", R = (o, e) => new Promise((t, i) => {
  const l = document.createElement("link");
  l.rel = "stylesheet", l.href = e, l.setAttribute(w, o);
  const f = setTimeout(() => {
    l.parentNode && l.parentNode.removeChild(l), i(new Error(`[${o}] Timeout loading CSS from: ${e}`));
  }, 5e3);
  l.onload = () => {
    clearTimeout(f), t();
  }, l.onerror = () => {
    clearTimeout(f), l.parentNode && l.parentNode.removeChild(l), i(new Error(`[${o}] Failed to load CSS from: ${e}`));
  }, document.head.appendChild(l);
}), U = (o) => document.querySelectorAll(`[${w}="${o}"]`).length > 0, q = async (o) => {
  const {
    id: e,
    cssautoload: t = !0,
    csspath: i = "",
    debug: l = !1
  } = o;
  if (t === !1 || i === !1) return;
  if (U(e)) {
    l && console.log(`[${e}] CSS already loaded, skipping`);
    return;
  }
  const f = [];
  typeof i == "string" && i.trim() !== "" && f.push(i);
  const g = _(e);
  if (g) {
    const d = `${g}${e}.css`;
    f.push(d);
  }
  const h = `plugin/${e}/${e}.css`;
  f.push(h);
  for (const d of f)
    try {
      await R(e, d);
      let b = "CSS";
      i && d === i ? b = "user-specified CSS" : g && d === `${g}${e}.css` ? b = "CSS (auto-detected from script location)" : b = "CSS (standard fallback)", l && console.log(`[${e}] ${b} loaded successfully from: ${d}`);
      return;
    } catch {
      l && console.log(`[${e}] Failed to load CSS from: ${d}`);
    }
  console.warn(`[${e}] Could not load CSS from any location`);
};
class F {
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
        } catch (l) {
          console.error(`[${this.label}]: Error showing table:`, l), console.log(`[${this.label}]: Raw data:`, e);
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
    const l = i;
    if (e === "group" || e === "groupCollapsed") {
      t.length > 0 && typeof t[0] == "string" ? l.call(console, `[${this.label}]: ${t[0]}`, ...t.slice(1)) : l.call(console, `[${this.label}]:`, ...t);
      return;
    }
    if (e === "groupEnd") {
      l.call(console);
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
    this.groupDepth > 0 ? l.call(console, ...t) : t.length > 0 && typeof t[0] == "string" ? l.call(console, `[${this.label}]: ${t[0]}`, ...t.slice(1)) : l.call(console, `[${this.label}]:`, ...t);
  }
}
const B = (o) => new Proxy(o, {
  get: (e, t) => {
    if (t in e)
      return e[t];
    const i = t.toString();
    if (typeof console[i] == "function")
      return (...l) => {
        e.debugLog(i, ...l);
      };
  }
}), y = B(new F()), N = {
  demoOption: "default value",
  cssautoload: !0,
  csspath: "",
  debug: !1
};
class C {
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
    const i = new C(e, t);
    return i.initialize(), i;
  }
}
const G = async (o, e, t) => {
  if (y.initialize(t.debug, "demo-plugin"), t.cssautoload)
    try {
      await q({
        id: o.pluginId,
        cssautoload: t.cssautoload,
        csspath: t.csspath,
        debug: t.debug
      });
    } catch (i) {
      y.warn("CSS loading failed, but plugin will continue:", i);
    }
  await C.create(e, t);
}, V = () => new z("demo-plugin", G, N).createInterface();
export {
  V as default
};
