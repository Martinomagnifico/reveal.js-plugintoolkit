var _ = Object.defineProperty;
var $ = (r, e, n) => e in r ? _(r, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : r[e] = n;
var d = (r, e, n) => $(r, typeof e != "symbol" ? e + "" : e, n);
function D(r) {
  return r && r.__esModule && Object.prototype.hasOwnProperty.call(r, "default") ? r.default : r;
}
var p, C;
function I() {
  if (C) return p;
  C = 1;
  var r = function(i) {
    return e(i) && !n(i);
  };
  function e(t) {
    return !!t && typeof t == "object";
  }
  function n(t) {
    var i = Object.prototype.toString.call(t);
    return i === "[object RegExp]" || i === "[object Date]" || l(t);
  }
  var a = typeof Symbol == "function" && Symbol.for, s = a ? Symbol.for("react.element") : 60103;
  function l(t) {
    return t.$$typeof === s;
  }
  function f(t) {
    return Array.isArray(t) ? [] : {};
  }
  function m(t, i) {
    return i.clone !== !1 && i.isMergeableObject(t) ? g(f(t), t, i) : t;
  }
  function A(t, i, o) {
    return t.concat(i).map(function(u) {
      return m(u, o);
    });
  }
  function E(t, i) {
    if (!i.customMerge)
      return g;
    var o = i.customMerge(t);
    return typeof o == "function" ? o : g;
  }
  function j(t) {
    return Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(t).filter(function(i) {
      return Object.propertyIsEnumerable.call(t, i);
    }) : [];
  }
  function b(t) {
    return Object.keys(t).concat(j(t));
  }
  function h(t, i) {
    try {
      return i in t;
    } catch {
      return !1;
    }
  }
  function w(t, i) {
    return h(t, i) && !(Object.hasOwnProperty.call(t, i) && Object.propertyIsEnumerable.call(t, i));
  }
  function M(t, i, o) {
    var u = {};
    return o.isMergeableObject(t) && b(t).forEach(function(c) {
      u[c] = m(t[c], o);
    }), b(i).forEach(function(c) {
      w(t, c) || (h(t, c) && o.isMergeableObject(i[c]) ? u[c] = E(c, o)(t[c], i[c], o) : u[c] = m(i[c], o));
    }), u;
  }
  function g(t, i, o) {
    o = o || {}, o.arrayMerge = o.arrayMerge || A, o.isMergeableObject = o.isMergeableObject || r, o.cloneUnlessOtherwiseSpecified = m;
    var u = Array.isArray(i), c = Array.isArray(t), v = u === c;
    return v ? u ? o.arrayMerge(t, i, o) : M(t, i, o) : m(i, o);
  }
  g.all = function(i, o) {
    if (!Array.isArray(i))
      throw new Error("first argument should be an array");
    return i.reduce(function(u, c) {
      return g(u, c, o);
    }, {});
  };
  var O = g;
  return p = O, p;
}
var T = I();
const z = /* @__PURE__ */ D(T);
class U {
  /**
   * Create a new plugin instance
   * @param idOrOptions Plugin ID string or options object
   * @param init Optional initialization function
   * @param defaultConfig Optional default configuration
   */
  constructor(e, n, a) {
    d(this, "defaultConfig");
    d(this, "pluginInit");
    d(this, "pluginId");
    d(this, "mergedConfig", null);
    /** Public data storage for plugin state */
    d(this, "data", {});
    typeof e == "string" ? (this.pluginId = e, this.pluginInit = n, this.defaultConfig = a || {}) : (this.pluginId = e.id, this.pluginInit = e.init, this.defaultConfig = e.defaultConfig || {});
  }
  /**
   * Initialize plugin configuration by merging default and user settings
   */
  initializeConfig(e) {
    const n = this.defaultConfig, s = e.getConfig()[this.pluginId] || {};
    this.mergedConfig = z(n, s, {
      arrayMerge: (l, f) => f,
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
      init: (a) => this.init(a),
      getConfig: () => this.getCurrentConfig(),
      getData: () => this.getData(),
      ...e
    };
  }
}
const x = { DEV: !1 }, L = () => {
  const e = typeof import.meta < "u" ? x : void 0;
  return {
    isDevEnv: !!(e != null && e.DEV),
    isLocalFilesystem: window.location.protocol === "file:",
    hasNodeModules: !!document.querySelector('[src*="node_modules/"],[href*="node_modules/"]')
  };
}, N = (r) => !!document.querySelector(`[data-css-id="${r}"]`), F = (r, e) => {
  const n = document.createElement("style");
  n.setAttribute("data-css-id", r), n.textContent = "/* CSS loaded via import */", document.head.appendChild(n), e && console.log("Development CSS handled via import");
}, q = (r, e, n) => new Promise((a, s) => {
  const l = document.createElement("link");
  l.rel = "stylesheet", l.href = e, l.setAttribute("data-css-id", r);
  const f = setTimeout(() => {
    n && console.log(`[${r}] Timeout loading CSS from: ${e}`), s(new Error(`Timeout loading CSS from: ${e}`));
  }, 5e3);
  l.onload = () => {
    clearTimeout(f), n && console.log(`[${r}] CSS loaded from: ${e}`), a();
  }, l.onerror = () => {
    clearTimeout(f), s(new Error(`Failed to load CSS from: ${e}`));
  }, document.head.appendChild(l);
}), S = async (r, e, n, a) => {
  if (!e.length) return !1;
  for (const s of e)
    try {
      return await q(r, s, a), !0;
    } catch {
      a && console.log(`[${r}] Fail ${n}: ${s}`);
    }
  return !1;
}, R = async (r, e, n) => {
  if (!e) return !1;
  const a = Array.isArray(e) ? e : [e];
  return S(r, a, "user", n);
}, k = async (r, e, n, a) => {
  if (!e) return !1;
  let s = [];
  if (typeof e == "object" && !Array.isArray(e)) {
    if (n && e.npm ? (s = Array.isArray(e.npm) ? e.npm : [e.npm], a && console.log(`[${r}] Using npm paths`)) : e.standard && (s = Array.isArray(e.standard) ? e.standard : [e.standard], a && console.log(`[${r}] Using standard paths`)), e.fallback) {
      const l = Array.isArray(e.fallback) ? e.fallback : [e.fallback];
      s = [...s, ...l];
    }
  } else
    s = Array.isArray(e) ? e : [e];
  return S(r, s, "dev", a);
}, V = async (r) => {
  const {
    id: e,
    enableLoading: n = !0,
    userPath: a = "",
    developerPaths: s = [],
    debug: l = !1
  } = r;
  if (n === !1 || a === !1) return;
  if (N(e)) {
    l && console.log(`[${e}] Already loaded`);
    return;
  }
  const f = L();
  if (!await R(e, a, l)) {
    if (f.isDevEnv) {
      F(e, l);
      return;
    }
    await k(e, s, f.hasNodeModules, l) || console.warn(`[${e}] CSS loading failed. Specify path via csspath.`);
  }
}, B = {
  demoOption: "default value",
  cssautoload: !0,
  csspath: "",
  debug: !1
};
class y {
  constructor(e, n) {
    d(this, "deck");
    d(this, "options");
    this.deck = e, this.options = n, this.options.debug && console.log("Demo plugin initialized with options:", n);
  }
  // Example method to demonstrate functionality
  initialize() {
    this.options.debug && console.log("Demo plugin initialized successfully");
    const e = document.createElement("div");
    e.className = "demo-plugin-indicator", e.textContent = "Demo Plugin Active", document.body.appendChild(e), this.options.debug && console.log("Indicator element added");
  }
  static create(e, n) {
    const a = new y(e, n);
    return a.initialize(), a;
  }
}
const K = async (r, e, n) => {
  if (n.cssautoload)
    try {
      await V({
        id: r.pluginId,
        enableLoading: n.cssautoload,
        userPath: n.csspath,
        developerPaths: {
          // You could also use the pluginId as a variable here
          npm: "node_modules/reveal.js-demo-plugin/dist/demo-plugin.css",
          standard: "plugin/demo-plugin/demo-plugin.css",
          fallback: "./css/demo-plugin.css"
        },
        debug: n.debug
      });
    } catch (a) {
      console.warn("CSS loading failed, but plugin will continue:", a);
    }
  await y.create(e, n);
}, G = () => new U("demo-plugin", K, B).createInterface();
export {
  G as default
};
