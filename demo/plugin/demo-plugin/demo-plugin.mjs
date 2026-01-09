function P(r) {
  return r && r.__esModule && Object.prototype.hasOwnProperty.call(r, "default") ? r.default : r;
}
var C, M;
function L() {
  if (M) return C;
  M = 1;
  var r = function(l) {
    return e(l) && !t(l);
  };
  function e(o) {
    return !!o && typeof o == "object";
  }
  function t(o) {
    var l = Object.prototype.toString.call(o);
    return l === "[object RegExp]" || l === "[object Date]" || c(o);
  }
  var n = typeof Symbol == "function" && Symbol.for, i = n ? /* @__PURE__ */ Symbol.for("react.element") : 60103;
  function c(o) {
    return o.$$typeof === i;
  }
  function u(o) {
    return Array.isArray(o) ? [] : {};
  }
  function d(o, l) {
    return l.clone !== !1 && l.isMergeableObject(o) ? m(u(o), o, l) : o;
  }
  function f(o, l, s) {
    return o.concat(l).map(function(g) {
      return d(g, s);
    });
  }
  function p(o, l) {
    if (!l.customMerge)
      return m;
    var s = l.customMerge(o);
    return typeof s == "function" ? s : m;
  }
  function S(o) {
    return Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(o).filter(function(l) {
      return Object.propertyIsEnumerable.call(o, l);
    }) : [];
  }
  function b(o) {
    return Object.keys(o).concat(S(o));
  }
  function w(o, l) {
    try {
      return l in o;
    } catch {
      return !1;
    }
  }
  function j(o, l) {
    return w(o, l) && !(Object.hasOwnProperty.call(o, l) && Object.propertyIsEnumerable.call(o, l));
  }
  function T(o, l, s) {
    var g = {};
    return s.isMergeableObject(o) && b(o).forEach(function(a) {
      g[a] = d(o[a], s);
    }), b(l).forEach(function(a) {
      j(o, a) || (w(o, a) && s.isMergeableObject(l[a]) ? g[a] = p(a, s)(o[a], l[a], s) : g[a] = d(l[a], s));
    }), g;
  }
  function m(o, l, s) {
    s = s || {}, s.arrayMerge = s.arrayMerge || f, s.isMergeableObject = s.isMergeableObject || r, s.cloneUnlessOtherwiseSpecified = d;
    var g = Array.isArray(l), a = Array.isArray(o), x = g === a;
    return x ? g ? s.arrayMerge(o, l, s) : T(o, l, s) : d(l, s);
  }
  m.all = function(l, s) {
    if (!Array.isArray(l))
      throw new Error("first argument should be an array");
    return l.reduce(function(g, a) {
      return m(g, a, s);
    }, {});
  };
  var D = m;
  return C = D, C;
}
var O = L();
const z = /* @__PURE__ */ P(O);
let y = null;
const N = () => {
  if (y) return y;
  const r = typeof window < "u", e = typeof document < "u";
  let t = !1;
  try {
    const c = new Function('return typeof module !== "undefined" && !!module.hot')(), u = new Function('return typeof import.meta !== "undefined" && !!import.meta.hot')();
    t = c || u;
  } catch {
  }
  let n = !1;
  try {
    n = new Function('return typeof import.meta !== "undefined" && import.meta.env?.DEV === true')();
  } catch {
  }
  return y = {
    isDevelopment: t || n,
    hasHMR: t,
    isViteDev: n,
    hasWindow: r,
    hasDocument: e
  }, y;
};
class R {
  defaultConfig;
  pluginInit;
  pluginId;
  mergedConfig = null;
  userConfigData = null;
  /** Public data storage for plugin state */
  data = {};
  // Create a new plugin instance
  constructor(e, t, n) {
    typeof e == "string" ? (this.pluginId = e, this.pluginInit = t, this.defaultConfig = n || {}) : (this.pluginId = e.id, this.pluginInit = e.init, this.defaultConfig = e.defaultConfig || {});
  }
  // Initialize plugin configuration by merging default and user settings
  initializeConfig(e) {
    const t = this.defaultConfig, i = e.getConfig()[this.pluginId] || {};
    this.userConfigData = i, this.mergedConfig = z(t, i, {
      arrayMerge: (c, u) => u,
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
  // Gets information about the current JavaScript environment
  getEnvironmentInfo = () => N();
  // Initialize the plugin
  init(e) {
    if (this.initializeConfig(e), this.pluginInit)
      return this.pluginInit(this, e, this.getCurrentConfig());
  }
  // Create the plugin interface containing all exports
  createInterface(e = {}) {
    return {
      id: this.pluginId,
      init: (n) => this.init(n),
      getConfig: () => this.getCurrentConfig(),
      getData: () => this.getData(),
      ...e
    };
  }
}
const _ = (r) => {
  const e = document.querySelector(
    `script[src$="${r}.js"], script[src$="${r}.min.js"], script[src$="${r}.mjs"]`
  );
  if (e?.src) {
    const t = e.getAttribute("src") || "", n = t.lastIndexOf("/");
    if (n !== -1)
      return t.substring(0, n + 1);
  }
  try {
    if (typeof import.meta < "u" && import.meta.url)
      return import.meta.url.slice(0, import.meta.url.lastIndexOf("/") + 1);
  } catch {
  }
  return `plugin/${r}/`;
}, I = "data-css-id", F = (r, e) => new Promise((t, n) => {
  const i = document.createElement("link");
  i.rel = "stylesheet", i.href = e, i.setAttribute(I, r);
  const c = setTimeout(() => {
    i.parentNode && i.parentNode.removeChild(i), n(new Error(`[${r}] Timeout loading CSS from: ${e}`));
  }, 5e3);
  i.onload = () => {
    clearTimeout(c), t();
  }, i.onerror = () => {
    clearTimeout(c), i.parentNode && i.parentNode.removeChild(i), n(new Error(`[${r}] Failed to load CSS from: ${e}`));
  }, document.head.appendChild(i);
}), v = (r) => document.querySelectorAll(`[${I}="${r}"]`).length > 0, k = (r) => new Promise((e) => {
  if (t())
    return e(!0);
  setTimeout(() => {
    e(t());
  }, 50);
  function t() {
    if (v(r)) return !0;
    try {
      return window.getComputedStyle(document.documentElement).getPropertyValue(`--cssimported-${r}`).trim() !== "";
    } catch {
      return !1;
    }
  }
}), A = async (r) => {
  const { id: e, cssautoload: t = !0, csspath: n = "", debug: i = !1 } = r;
  if (t === !1 || n === !1) return;
  if (v(e) && !(typeof n == "string" && n.trim() !== "")) {
    i && console.log(`[${e}] CSS is already loaded, skipping`);
    return;
  }
  v(e) && typeof n == "string" && n.trim() !== "" && i && console.log(`[${e}] CSS is already loaded, also loading user-specified path: ${n}`);
  const c = [];
  typeof n == "string" && n.trim() !== "" && c.push(n);
  const u = _(e);
  if (u) {
    const f = `${u}${e}.css`;
    c.push(f);
  }
  const d = `plugin/${e}/${e}.css`;
  c.push(d);
  for (const f of c)
    try {
      await F(e, f);
      let p = "CSS";
      n && f === n ? p = "user-specified CSS" : u && f === `${u}${e}.css` ? p = "CSS (auto-detected from script location)" : p = "CSS (standard fallback)", i && console.log(`[${e}] ${p} loaded successfully from: ${f}`);
      return;
    } catch {
      i && console.log(`[${e}] Failed to load CSS from: ${f}`);
    }
  console.warn(`[${e}] Could not load CSS from any location`);
};
async function H(r, e) {
  if ("getEnvironmentInfo" in r && e) {
    const t = r, n = t.getEnvironmentInfo();
    if (await k(t.pluginId) && !(typeof e.csspath == "string" && e.csspath.trim() !== "")) {
      e.debug && console.log(`[${t.pluginId}] CSS is already imported, skipping`);
      return;
    }
    if ("cssautoload" in t.userConfig ? !!e.cssautoload : !n.isDevelopment)
      return A({
        id: t.pluginId,
        cssautoload: !0,
        csspath: e.csspath,
        debug: e.debug
      });
    n.isDevelopment && console.warn(
      `[${t.pluginId}] CSS autoloading is disabled in bundler environments. Please import the CSS manually, using import.`
    );
    return;
  }
  return A(r);
}
class V {
  // Flag to enable/disable all debugging output
  debugMode = !1;
  // Label to prefix all debug messages with
  label = "DEBUG";
  // Tracks the current depth of console groups for proper formatting
  groupDepth = 0;
  // Initializes the debug utility with custom settings.
  initialize(e, t = "DEBUG") {
    this.debugMode = e, this.label = t;
  }
  // Creates a new console group and tracks the group depth. 
  // Groups will always display the label prefix in their header.
  group = (...e) => {
    this.debugLog("group", ...e), this.groupDepth++;
  };
  // Creates a new collapsed console group and tracks the group depth.
  groupCollapsed = (...e) => {
    this.debugLog("groupCollapsed", ...e), this.groupDepth++;
  };
  // Ends the current console group and updates the group depth tracker.
  groupEnd = () => {
    this.groupDepth > 0 && (this.groupDepth--, this.debugLog("groupEnd"));
  };
  // Formats and logs an error message with the debug label. 
  // Error messages are always shown, even when debug mode is disabled.
  error = (...e) => {
    const t = this.debugMode;
    this.debugMode = !0, this.formatAndLog(console.error, e), this.debugMode = t;
  };
  // Displays a table in the console with the pluginDebug label.
  // Special implementation for console.table to handle tabular data properly.
  // @param messageOrData - Either a message string or the tabular data
  // @param propertiesOrData - Either property names or tabular data (if first param was message)
  // @param optionalProperties - Optional property names (if first param was message)
  table = (e, t, n) => {
    if (this.debugMode)
      try {
        typeof e == "string" && t !== void 0 && typeof t != "string" ? (this.groupDepth === 0 ? console.log(`[${this.label}]: ${e}`) : console.log(e), n ? console.table(t, n) : console.table(t)) : (this.groupDepth === 0 && console.log(`[${this.label}]: Table data`), typeof t == "object" && Array.isArray(t) ? console.table(e, t) : console.table(e));
      } catch (i) {
        console.error(`[${this.label}]: Error showing table:`, i), console.log(`[${this.label}]: Raw data:`, e);
      }
  };
  // Helper method that formats and logs messages with the pluginDebug label.
  // @param logMethod - The console method to use for logging
  // @param args - Arguments to pass to the console method
  formatAndLog = (e, t) => {
    if (this.debugMode)
      try {
        this.groupDepth > 0 ? e.call(console, ...t) : t.length > 0 && typeof t[0] == "string" ? e.call(console, `[${this.label}]: ${t[0]}`, ...t.slice(1)) : e.call(console, `[${this.label}]:`, ...t);
      } catch (n) {
        console.error(`[${this.label}]: Error in logging:`, n), console.log(`[${this.label}]: Original log data:`, ...t);
      }
  };
  // Core method that handles calling console methods with proper formatting.
  // - Adds label prefix to messages outside of groups
  // - Skips label prefix for messages inside groups to avoid redundancy
  // - Always adds label prefix to group headers
  // - Error messages are always shown regardless of debug mode
  // @param methodName - Name of the console method to call
  // @param args - Arguments to pass to the console method
  debugLog(e, ...t) {
    const n = console[e];
    if (!this.debugMode && e !== "error" || typeof n != "function") return;
    const i = n;
    if (e === "group" || e === "groupCollapsed") {
      t.length > 0 && typeof t[0] == "string" ? i.call(console, `[${this.label}]: ${t[0]}`, ...t.slice(1)) : i.call(console, `[${this.label}]:`, ...t);
      return;
    }
    if (e === "groupEnd") {
      i.call(console);
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
    this.groupDepth > 0 ? i.call(console, ...t) : t.length > 0 && typeof t[0] == "string" ? i.call(console, `[${this.label}]: ${t[0]}`, ...t.slice(1)) : i.call(console, `[${this.label}]:`, ...t);
  }
}
const U = (r) => new Proxy(r, {
  get: (e, t) => {
    if (t in e)
      return e[t];
    const n = t.toString();
    if (typeof console[n] == "function")
      return (...i) => {
        e.debugLog(n, ...i);
      };
  }
}), h = U(new V()), q = (r) => {
  let [e, t] = [0, 0];
  r.on("slidechanged", (n) => {
    const { indexh: i, indexv: c, previousSlide: u, currentSlide: d } = n;
    i !== e && r.dispatchEvent({
      type: "slidechanged-h",
      data: { previousSlide: u, currentSlide: d, indexh: i, indexv: c }
    }), c !== t && i === e && r.dispatchEvent({
      type: "slidechanged-v",
      data: { previousSlide: u, currentSlide: d, indexh: i, indexv: c }
    }), [e, t] = [i, c];
  });
}, B = q, G = (r) => {
  const e = r.getViewportElement();
  if (!e)
    return console.warn("[verticator]: Could not find viewport element"), () => {
    };
  const t = () => e.classList.contains("reveal-scroll");
  let n = t(), i = !0;
  const c = new MutationObserver(() => {
    if (!i) return;
    const u = t();
    if (u !== n) {
      const d = r.getCurrentSlide(), f = r.getIndices(), p = f.h, S = f.v, b = u ? "scrollmode-enter" : "scrollmode-exit";
      r.dispatchEvent({
        type: b,
        data: {
          currentSlide: d,
          previousSlide: null,
          indexh: p,
          indexv: S
          // We can add stuff here if needed. Plugin-authors, just ask!
        }
      }), n = u;
    }
  });
  return c.observe(e, { attributes: !0, attributeFilter: ["class"] }), () => {
    i = !1, c.disconnect();
  };
}, E = (r) => r instanceof HTMLElement && r.tagName === "SECTION", K = (r) => E(r) ? Array.from(r.children).some(
  (e) => e instanceof HTMLElement && e.tagName === "SECTION"
) : !1, W = (r) => E(r) ? r.parentElement instanceof HTMLElement && r.parentElement.tagName === "SECTION" : !1, Y = (r) => E(r) ? W(r) ? "vertical" : K(r) ? "stack" : "horizontal" : "invalid", J = {
  demoOption: "default value",
  cssautoload: !0,
  csspath: "",
  debug: !1
};
class $ {
  deck;
  options;
  currentSlide = null;
  constructor(e, t) {
    this.deck = e, this.options = t, h.log("Demo plugin initialized with options:", t);
  }
  // Example method to demonstrate functionality
  initialize() {
    h.log("Demo plugin initialized successfully");
    const e = document.createElement("div");
    e.className = "demo-plugin-indicator", e.textContent = "Demo Plugin Active", document.body.appendChild(e), h.log("Indicator element added"), B(this.deck), G(this.deck), this.deck.on("slidechanged-h", (t) => {
      const n = t;
      if (n.currentSlide !== this.currentSlide) {
        h.log("Moved horizontally", n);
        const i = Y(n.currentSlide);
        h.log("Slide type:", i), this.currentSlide = n.currentSlide;
      }
    }), this.deck.on("slidechanged-v", (t) => {
      const n = t;
      n.currentSlide !== this.currentSlide && (h.log("Moved vertically", n), this.currentSlide = n.currentSlide);
    }), this.deck.on("scrollmode-enter", (t) => {
      const n = t;
      h.log("Scroll mode enter", n);
    }), this.deck.on("scrollmode-exit", (t) => {
      const n = t;
      h.log("Scroll mode exit", n);
    });
  }
  static create(e, t) {
    const n = new $(e, t);
    return n.initialize(), n;
  }
}
const Q = async (r, e, t) => {
  h.initialize(t.debug, "demo-plugin");
  const n = r.getEnvironmentInfo();
  h.log("Environment:", n), await H(r, t), await $.create(e, t);
}, X = () => new R("demo-plugin", Q, J).createInterface();
export {
  X as default
};
