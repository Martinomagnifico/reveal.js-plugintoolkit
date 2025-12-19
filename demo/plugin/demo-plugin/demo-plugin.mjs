function P(r) {
  return r && r.__esModule && Object.prototype.hasOwnProperty.call(r, "default") ? r.default : r;
}
var S, w;
function L() {
  if (w) return S;
  w = 1;
  var r = function(l) {
    return e(l) && !t(l);
  };
  function e(i) {
    return !!i && typeof i == "object";
  }
  function t(i) {
    var l = Object.prototype.toString.call(i);
    return l === "[object RegExp]" || l === "[object Date]" || c(i);
  }
  var n = typeof Symbol == "function" && Symbol.for, o = n ? /* @__PURE__ */ Symbol.for("react.element") : 60103;
  function c(i) {
    return i.$$typeof === o;
  }
  function u(i) {
    return Array.isArray(i) ? [] : {};
  }
  function a(i, l) {
    return l.clone !== !1 && l.isMergeableObject(i) ? b(u(i), i, l) : i;
  }
  function d(i, l, s) {
    return i.concat(l).map(function(g) {
      return a(g, s);
    });
  }
  function p(i, l) {
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
  function y(i) {
    return Object.keys(i).concat(m(i));
  }
  function $(i, l) {
    try {
      return l in i;
    } catch {
      return !1;
    }
  }
  function I(i, l) {
    return $(i, l) && !(Object.hasOwnProperty.call(i, l) && Object.propertyIsEnumerable.call(i, l));
  }
  function j(i, l, s) {
    var g = {};
    return s.isMergeableObject(i) && y(i).forEach(function(f) {
      g[f] = a(i[f], s);
    }), y(l).forEach(function(f) {
      I(i, f) || ($(i, f) && s.isMergeableObject(l[f]) ? g[f] = p(f, s)(i[f], l[f], s) : g[f] = a(l[f], s));
    }), g;
  }
  function b(i, l, s) {
    s = s || {}, s.arrayMerge = s.arrayMerge || d, s.isMergeableObject = s.isMergeableObject || r, s.cloneUnlessOtherwiseSpecified = a;
    var g = Array.isArray(l), f = Array.isArray(i), D = g === f;
    return D ? g ? s.arrayMerge(i, l, s) : j(i, l, s) : a(l, s);
  }
  b.all = function(l, s) {
    if (!Array.isArray(l))
      throw new Error("first argument should be an array");
    return l.reduce(function(g, f) {
      return b(g, f, s);
    }, {});
  };
  var T = b;
  return S = T, S;
}
var x = L();
const O = /* @__PURE__ */ P(x), z = () => {
  const r = typeof window < "u", e = typeof document < "u", t = r && typeof location < "u" && /localhost|127\.0\.0\.1/.test(location.hostname);
  let n = !1;
  try {
    n = new Function('return typeof module !== "undefined" && !!module.hot')();
  } catch {
  }
  let o = !1;
  try {
    o = new Function('return typeof import.meta !== "undefined" && typeof import.meta.env !== "undefined" && import.meta.env.DEV === true')();
  } catch {
  }
  const c = r && typeof navigator < "u" && /vite|localhost|127\.0\.0\.1/.test(location.origin) && /AppleWebKit|Chrome|Vite/.test(navigator.userAgent), u = e && !!document.querySelector('script[type="module"]');
  let a = !1;
  try {
    a = new Function('return typeof process !== "undefined" && process.env && (process.env.ROLLUP_WATCH === "true" || process.env.NODE_ENV === "development")')();
  } catch {
  }
  let d = !1;
  try {
    d = new Function('return typeof define === "function" && !!define.amd')();
  } catch {
  }
  return {
    isDevServer: t,
    isWebpackHMR: n,
    isVite: o,
    isVitePreview: c,
    hasModuleScripts: u,
    isModuleBundler: a,
    isAMD: d,
    isBundlerEnvironment: n || o || c || u || a || d || t
  };
};
class N {
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
    const t = this.defaultConfig, o = e.getConfig()[this.pluginId] || {};
    this.userConfigData = o, this.mergedConfig = O(t, o, {
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
  getEnvironmentInfo = () => z();
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
}, A = "data-css-id", V = (r, e) => new Promise((t, n) => {
  const o = document.createElement("link");
  o.rel = "stylesheet", o.href = e, o.setAttribute(A, r);
  const c = setTimeout(() => {
    o.parentNode && o.parentNode.removeChild(o), n(new Error(`[${r}] Timeout loading CSS from: ${e}`));
  }, 5e3);
  o.onload = () => {
    clearTimeout(c), t();
  }, o.onerror = () => {
    clearTimeout(c), o.parentNode && o.parentNode.removeChild(o), n(new Error(`[${r}] Failed to load CSS from: ${e}`));
  }, document.head.appendChild(o);
}), v = (r) => document.querySelectorAll(`[${A}="${r}"]`).length > 0, F = (r) => new Promise((e) => {
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
}), M = async (r) => {
  const { id: e, cssautoload: t = !0, csspath: n = "", debug: o = !1 } = r;
  if (t === !1 || n === !1) return;
  if (v(e) && !(typeof n == "string" && n.trim() !== "")) {
    o && console.log(`[${e}] CSS is already loaded, skipping`);
    return;
  }
  v(e) && typeof n == "string" && n.trim() !== "" && o && console.log(`[${e}] CSS is already loaded, also loading user-specified path: ${n}`);
  const c = [];
  typeof n == "string" && n.trim() !== "" && c.push(n);
  const u = _(e);
  if (u) {
    const d = `${u}${e}.css`;
    c.push(d);
  }
  const a = `plugin/${e}/${e}.css`;
  c.push(a);
  for (const d of c)
    try {
      await V(e, d);
      let p = "CSS";
      n && d === n ? p = "user-specified CSS" : u && d === `${u}${e}.css` ? p = "CSS (auto-detected from script location)" : p = "CSS (standard fallback)", o && console.log(`[${e}] ${p} loaded successfully from: ${d}`);
      return;
    } catch {
      o && console.log(`[${e}] Failed to load CSS from: ${d}`);
    }
  console.warn(`[${e}] Could not load CSS from any location`);
};
async function B(r, e) {
  if ("getEnvironmentInfo" in r && e) {
    const t = r, n = t.getEnvironmentInfo();
    if (await F(t.pluginId) && !(typeof e.csspath == "string" && e.csspath.trim() !== "")) {
      e.debug && console.log(`[${t.pluginId}] CSS is already imported, skipping`);
      return;
    }
    if ("cssautoload" in t.userConfig ? !!e.cssautoload : !n.isBundlerEnvironment)
      return M({
        id: t.pluginId,
        cssautoload: !0,
        csspath: e.csspath,
        debug: e.debug
      });
    n.isBundlerEnvironment && console.warn(
      `[${t.pluginId}] CSS autoloading is disabled in bundler environments. Please import the CSS manually, using import.`
    );
    return;
  }
  return M(r);
}
class R {
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
      } catch (o) {
        console.error(`[${this.label}]: Error showing table:`, o), console.log(`[${this.label}]: Raw data:`, e);
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
    const o = n;
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
const k = (r) => new Proxy(r, {
  get: (e, t) => {
    if (t in e)
      return e[t];
    const n = t.toString();
    if (typeof console[n] == "function")
      return (...o) => {
        e.debugLog(n, ...o);
      };
  }
}), h = k(new R()), U = (r) => {
  let [e, t] = [0, 0];
  r.on("slidechanged", (n) => {
    const { indexh: o, indexv: c, previousSlide: u, currentSlide: a } = n;
    o !== e && r.dispatchEvent({
      type: "slidechanged-h",
      data: { previousSlide: u, currentSlide: a, indexh: o, indexv: c }
    }), c !== t && o === e && r.dispatchEvent({
      type: "slidechanged-v",
      data: { previousSlide: u, currentSlide: a, indexh: o, indexv: c }
    }), [e, t] = [o, c];
  });
}, H = U, q = (r) => {
  const e = r.getViewportElement();
  if (!e)
    return console.warn("[verticator]: Could not find viewport element"), () => {
    };
  const t = () => e.classList.contains("reveal-scroll");
  let n = t(), o = !0;
  const c = new MutationObserver(() => {
    if (!o) return;
    const u = t();
    if (u !== n) {
      const a = r.getCurrentSlide(), d = r.getIndices(), p = d.h, m = d.v, y = u ? "scrollmode-enter" : "scrollmode-exit";
      r.dispatchEvent({
        type: y,
        data: {
          currentSlide: a,
          previousSlide: null,
          indexh: p,
          indexv: m
          // We can add stuff here if needed. Plugin-authors, just ask!
        }
      }), n = u;
    }
  });
  return c.observe(e, { attributes: !0, attributeFilter: ["class"] }), () => {
    o = !1, c.disconnect();
  };
}, C = (r) => r instanceof HTMLElement && r.tagName === "SECTION", W = (r) => C(r) ? Array.from(r.children).some(
  (e) => e instanceof HTMLElement && e.tagName === "SECTION"
) : !1, G = (r) => C(r) ? r.parentElement instanceof HTMLElement && r.parentElement.tagName === "SECTION" : !1, K = (r) => C(r) ? G(r) ? "vertical" : W(r) ? "stack" : "horizontal" : "invalid", Y = {
  demoOption: "default value",
  cssautoload: !0,
  csspath: "",
  debug: !1
};
class E {
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
    e.className = "demo-plugin-indicator", e.textContent = "Demo Plugin Active", document.body.appendChild(e), h.log("Indicator element added"), H(this.deck), q(this.deck), this.deck.on("slidechanged-h", (t) => {
      const n = t;
      if (n.currentSlide !== this.currentSlide) {
        h.log("Moved horizontally", n);
        const o = K(n.currentSlide);
        h.log("Slide type:", o), this.currentSlide = n.currentSlide;
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
    const n = new E(e, t);
    return n.initialize(), n;
  }
}
const J = async (r, e, t) => {
  h.initialize(t.debug, "demo-plugin");
  const n = r.getEnvironmentInfo();
  h.log("Environment:", n), await B(r, t), await E.create(e, t);
}, Q = () => new N("demo-plugin", J, Y).createInterface();
export {
  Q as default
};
