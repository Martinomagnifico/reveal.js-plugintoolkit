var $ = Object.defineProperty;
var _ = (n, e, r) => e in n ? $(n, e, { enumerable: !0, configurable: !0, writable: !0, value: r }) : n[e] = r;
var f = (n, e, r) => _(n, typeof e != "symbol" ? e + "" : e, r);
function D(n) {
  return n && n.__esModule && Object.prototype.hasOwnProperty.call(n, "default") ? n.default : n;
}
var p, C;
function I() {
  if (C) return p;
  C = 1;
  var n = function(i) {
    return e(i) && !r(i);
  };
  function e(t) {
    return !!t && typeof t == "object";
  }
  function r(t) {
    var i = Object.prototype.toString.call(t);
    return i === "[object RegExp]" || i === "[object Date]" || a(t);
  }
  var o = typeof Symbol == "function" && Symbol.for, l = o ? Symbol.for("react.element") : 60103;
  function a(t) {
    return t.$$typeof === l;
  }
  function u(t) {
    return Array.isArray(t) ? [] : {};
  }
  function m(t, i) {
    return i.clone !== !1 && i.isMergeableObject(t) ? g(u(t), t, i) : t;
  }
  function S(t, i, s) {
    return t.concat(i).map(function(d) {
      return m(d, s);
    });
  }
  function v(t, i) {
    if (!i.customMerge)
      return g;
    var s = i.customMerge(t);
    return typeof s == "function" ? s : g;
  }
  function E(t) {
    return Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(t).filter(function(i) {
      return Object.propertyIsEnumerable.call(t, i);
    }) : [];
  }
  function h(t) {
    return Object.keys(t).concat(E(t));
  }
  function b(t, i) {
    try {
      return i in t;
    } catch {
      return !1;
    }
  }
  function j(t, i) {
    return b(t, i) && !(Object.hasOwnProperty.call(t, i) && Object.propertyIsEnumerable.call(t, i));
  }
  function w(t, i, s) {
    var d = {};
    return s.isMergeableObject(t) && h(t).forEach(function(c) {
      d[c] = m(t[c], s);
    }), h(i).forEach(function(c) {
      j(t, c) || (b(t, c) && s.isMergeableObject(i[c]) ? d[c] = v(c, s)(t[c], i[c], s) : d[c] = m(i[c], s));
    }), d;
  }
  function g(t, i, s) {
    s = s || {}, s.arrayMerge = s.arrayMerge || S, s.isMergeableObject = s.isMergeableObject || n, s.cloneUnlessOtherwiseSpecified = m;
    var d = Array.isArray(i), c = Array.isArray(t), O = d === c;
    return O ? d ? s.arrayMerge(t, i, s) : w(t, i, s) : m(i, s);
  }
  g.all = function(i, s) {
    if (!Array.isArray(i))
      throw new Error("first argument should be an array");
    return i.reduce(function(d, c) {
      return g(d, c, s);
    }, {});
  };
  var M = g;
  return p = M, p;
}
var T = I();
const P = /* @__PURE__ */ D(T);
class z {
  /**
   * Create a new plugin instance
   * @param idOrOptions Plugin ID string or options object
   * @param init Optional initialization function
   * @param defaultConfig Optional default configuration
   */
  constructor(e, r, o) {
    f(this, "defaultConfig");
    f(this, "pluginInit");
    f(this, "pluginId");
    f(this, "mergedConfig", null);
    /** Public data storage for plugin state */
    f(this, "data", {});
    typeof e == "string" ? (this.pluginId = e, this.pluginInit = r, this.defaultConfig = o || {}) : (this.pluginId = e.id, this.pluginInit = e.init, this.defaultConfig = e.defaultConfig || {});
  }
  /**
   * Initialize plugin configuration by merging default and user settings
   */
  initializeConfig(e) {
    const r = this.defaultConfig, l = e.getConfig()[this.pluginId] || {};
    this.mergedConfig = P(r, l, {
      arrayMerge: (a, u) => u,
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
      init: (o) => this.init(o),
      getConfig: () => this.getCurrentConfig(),
      getData: () => this.getData(),
      ...e
    };
  }
}
const U = { DEV: !1 }, x = () => {
  const e = typeof import.meta < "u" ? U : void 0;
  return {
    isDevEnv: !!(e != null && e.DEV),
    isLocalFilesystem: window.location.protocol === "file:",
    hasNodeModules: !!document.querySelector('[src*="node_modules/"],[href*="node_modules/"]')
  };
}, L = (n) => !!document.querySelector(`[data-css-id="${n}"]`), F = (n, e) => {
  const r = document.createElement("style");
  r.setAttribute("data-css-id", n), r.textContent = "/* CSS loaded via import */", document.head.appendChild(r), e && console.log("Development CSS handled via import");
}, N = (n, e, r) => new Promise((o, l) => {
  const a = document.createElement("link");
  a.rel = "stylesheet", a.href = e, a.setAttribute("data-css-id", n);
  const u = setTimeout(() => {
    r && console.log(`[${n}] Timeout loading CSS from: ${e}`), l(new Error(`Timeout loading CSS from: ${e}`));
  }, 5e3);
  a.onload = () => {
    clearTimeout(u), r && console.log(`[${n}] CSS loaded from: ${e}`), o();
  }, a.onerror = () => {
    clearTimeout(u), l(new Error(`Failed to load CSS from: ${e}`));
  }, document.head.appendChild(a);
}), A = async (n, e, r, o) => {
  if (!e.length) return !1;
  for (const l of e)
    try {
      return await N(n, l, o), !0;
    } catch {
      o && console.log(`[${n}] Fail ${r}: ${l}`);
    }
  return !1;
}, k = async (n, e, r) => {
  if (!e) return !1;
  const o = Array.isArray(e) ? e : [e];
  return A(n, o, "user", r);
}, q = async (n, e, r, o) => {
  if (!e) return !1;
  let l = [];
  if (typeof e == "object" && !Array.isArray(e)) {
    const a = e;
    if (r && a.npm) {
      const u = Array.isArray(a.npm) ? a.npm : [a.npm];
      l = [...l, ...u], o && console.log(`[${n}] Using npm paths first`);
    }
    if (a.standard) {
      const u = Array.isArray(a.standard) ? a.standard : [a.standard];
      l = [...l, ...u], !r || !a.npm ? o && console.log(`[${n}] Using standard paths`) : o && console.log(`[${n}] Adding standard paths as fallback`);
    }
    if (a.fallback) {
      const u = Array.isArray(a.fallback) ? a.fallback : [a.fallback];
      l = [...l, ...u];
    }
  } else
    l = Array.isArray(e) ? e : [e];
  return A(n, l, "dev", o);
}, R = async (n) => {
  const {
    id: e,
    enableLoading: r = !0,
    userPath: o = "",
    developerPaths: l = [],
    debug: a = !1
  } = n;
  if (r === !1 || o === !1) return;
  if (L(e)) {
    a && console.log(`[${e}] Already loaded`);
    return;
  }
  const u = x();
  if (!await k(e, o, a)) {
    if (u.isDevEnv) {
      F(e, a);
      return;
    }
    await q(e, l, u.hasNodeModules, a) || console.warn(`[${e}] CSS loading failed. Specify path via csspath.`);
  }
}, V = {
  demoOption: "default value",
  cssautoload: !0,
  csspath: "",
  debug: !1
};
class y {
  constructor(e, r) {
    f(this, "deck");
    f(this, "options");
    this.deck = e, this.options = r, this.options.debug && console.log("Demo plugin initialized with options:", r);
  }
  // Example method to demonstrate functionality
  initialize() {
    this.options.debug && console.log("Demo plugin initialized successfully");
    const e = document.createElement("div");
    e.className = "demo-plugin-indicator", e.textContent = "Demo Plugin Active", document.body.appendChild(e), this.options.debug && console.log("Indicator element added");
  }
  static create(e, r) {
    const o = new y(e, r);
    return o.initialize(), o;
  }
}
const B = async (n, e, r) => {
  if (r.cssautoload)
    try {
      await R({
        id: n.pluginId,
        enableLoading: r.cssautoload,
        userPath: r.csspath,
        developerPaths: {
          // You could also use the pluginId as a variable here
          npm: "node_modules/reveal.js-demo-plugin/dist/demo-plugin.css",
          standard: "plugin/demo-plugin/demo-plugin.css",
          fallback: "./css/demo-plugin.css"
        },
        debug: r.debug
      });
    } catch (o) {
      console.warn("CSS loading failed, but plugin will continue:", o);
    }
  await y.create(e, r);
}, Y = () => new z("demo-plugin", B, V).createInterface();
export {
  Y as default
};
