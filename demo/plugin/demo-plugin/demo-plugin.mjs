var M = Object.defineProperty;
var P = (i, e, n) => e in i ? M(i, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : i[e] = n;
var p = (i, e, n) => P(i, typeof e != "symbol" ? e + "" : e, n);
function v(i) {
  return i && i.__esModule && Object.prototype.hasOwnProperty.call(i, "default") ? i.default : i;
}
var y, j;
function T() {
  if (j) return y;
  j = 1;
  var i = function(r) {
    return e(r) && !n(r);
  };
  function e(t) {
    return !!t && typeof t == "object";
  }
  function n(t) {
    var r = Object.prototype.toString.call(t);
    return r === "[object RegExp]" || r === "[object Date]" || a(t);
  }
  var s = typeof Symbol == "function" && Symbol.for, c = s ? Symbol.for("react.element") : 60103;
  function a(t) {
    return t.$$typeof === c;
  }
  function u(t) {
    return Array.isArray(t) ? [] : {};
  }
  function g(t, r) {
    return r.clone !== !1 && r.isMergeableObject(t) ? m(u(t), t, r) : t;
  }
  function b(t, r, o) {
    return t.concat(r).map(function(f) {
      return g(f, o);
    });
  }
  function d(t, r) {
    if (!r.customMerge)
      return m;
    var o = r.customMerge(t);
    return typeof o == "function" ? o : m;
  }
  function h(t) {
    return Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(t).filter(function(r) {
      return Object.propertyIsEnumerable.call(t, r);
    }) : [];
  }
  function S(t) {
    return Object.keys(t).concat(h(t));
  }
  function $(t, r) {
    try {
      return r in t;
    } catch {
      return !1;
    }
  }
  function w(t, r) {
    return $(t, r) && !(Object.hasOwnProperty.call(t, r) && Object.propertyIsEnumerable.call(t, r));
  }
  function O(t, r, o) {
    var f = {};
    return o.isMergeableObject(t) && S(t).forEach(function(l) {
      f[l] = g(t[l], o);
    }), S(r).forEach(function(l) {
      w(t, l) || ($(t, l) && o.isMergeableObject(r[l]) ? f[l] = d(l, o)(t[l], r[l], o) : f[l] = g(r[l], o));
    }), f;
  }
  function m(t, r, o) {
    o = o || {}, o.arrayMerge = o.arrayMerge || b, o.isMergeableObject = o.isMergeableObject || i, o.cloneUnlessOtherwiseSpecified = g;
    var f = Array.isArray(r), l = Array.isArray(t), I = f === l;
    return I ? f ? o.arrayMerge(t, r, o) : O(t, r, o) : g(r, o);
  }
  m.all = function(r, o) {
    if (!Array.isArray(r))
      throw new Error("first argument should be an array");
    return r.reduce(function(f, l) {
      return m(f, l, o);
    }, {});
  };
  var E = m;
  return y = E, y;
}
var x = T();
const D = /* @__PURE__ */ v(x);
class N {
  /**
   * Create a new plugin instance
   * @param idOrOptions Plugin ID string or options object
   * @param init Optional initialization function
   * @param defaultConfig Optional default configuration
   */
  constructor(e, n, s) {
    p(this, "defaultConfig");
    p(this, "pluginInit");
    p(this, "pluginId");
    p(this, "mergedConfig", null);
    /** Public data storage for plugin state */
    p(this, "data", {});
    typeof e == "string" ? (this.pluginId = e, this.pluginInit = n, this.defaultConfig = s || {}) : (this.pluginId = e.id, this.pluginInit = e.init, this.defaultConfig = e.defaultConfig || {});
  }
  /**
   * Initialize plugin configuration by merging default and user settings
   */
  initializeConfig(e) {
    const n = this.defaultConfig, c = e.getConfig()[this.pluginId] || {};
    this.mergedConfig = D(n, c, {
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
      init: (s) => this.init(s),
      getConfig: () => this.getCurrentConfig(),
      getData: () => this.getData(),
      ...e
    };
  }
}
const _ = (i) => {
  const e = document.querySelector(
    `script[src$="${i}.js"], script[src$="${i}.min.js"], script[src$="${i}.mjs"]`
  );
  if (e != null && e.src) {
    const n = e.getAttribute("src") || "", s = n.lastIndexOf("/");
    if (s !== -1)
      return n.substring(0, s + 1);
  }
  try {
    if (typeof import.meta < "u" && import.meta.url)
      return import.meta.url.slice(0, import.meta.url.lastIndexOf("/") + 1);
  } catch {
  }
  return `plugin/${i}/`;
}, A = "data-css-id", z = (i, e, n) => new Promise((s, c) => {
  const a = document.createElement("link");
  a.rel = "stylesheet", a.href = e, a.setAttribute(A, i);
  const u = setTimeout(() => {
    a.parentNode && a.parentNode.removeChild(a), n && console.log(`[${i}] Timeout loading CSS from: ${e}`), c(new Error(`Timeout loading CSS from: ${e}`));
  }, 5e3);
  a.onload = () => {
    clearTimeout(u), s();
  }, a.onerror = () => {
    clearTimeout(u), a.parentNode && a.parentNode.removeChild(a), c(new Error(`Failed to load CSS from: ${e}`));
  }, document.head.appendChild(a);
}), L = (i) => document.querySelectorAll(`[${A}="${i}"]`).length > 0, R = async (i) => {
  const {
    id: e,
    cssautoload: n = !0,
    csspath: s = "",
    debug: c = !1
  } = i;
  if (n === !1 || s === !1) return;
  if (L(e)) {
    c && console.log(`[${e}] CSS already loaded, skipping`);
    return;
  }
  const a = [];
  typeof s == "string" && s.trim() !== "" && (a.push(s), c && console.log(`[${e}] Added user-specified path: ${s}`));
  const u = _(e);
  if (u) {
    const d = `${u}${e}.css`;
    a.push(d), c && console.log(`[${e}] Added auto-detected path from script location: ${d}`);
  }
  const g = `plugin/${e}/${e}.css`;
  a.push(g), c && console.log(`[${e}] Added standard fallback path: ${g}`);
  const b = `plugins/${e}/${e}.css`;
  a.push(b), c && console.log(`[${e}] Added standard fallback path: ${b}`);
  for (const d of a)
    try {
      c && console.log(`[${e}] Trying CSS path: ${d}`), await z(e, d, c);
      let h = "CSS";
      s && d === s ? h = "user-specified CSS" : u && d === `${u}${e}.css` ? h = "auto-detected script location CSS" : h = "standard fallback CSS", c && console.log(`[${e}] ${h} loaded successfully from: ${d}`);
      return;
    } catch {
      c && console.log(`[${e}] Failed to load CSS from: ${d}`);
    }
  console.warn(`[${e}] Could not load CSS from any location`);
}, q = {
  demoOption: "default value",
  cssautoload: !0,
  csspath: "",
  debug: !1
};
class C {
  constructor(e, n) {
    p(this, "deck");
    p(this, "options");
    this.deck = e, this.options = n, this.options.debug && console.log("Demo plugin initialized with options:", n);
  }
  // Example method to demonstrate functionality
  initialize() {
    this.options.debug && console.log("Demo plugin initialized successfully");
    const e = document.createElement("div");
    e.className = "demo-plugin-indicator", e.textContent = "Demo Plugin Active", document.body.appendChild(e), this.options.debug && console.log("Indicator element added");
  }
  static create(e, n) {
    const s = new C(e, n);
    return s.initialize(), s;
  }
}
const F = async (i, e, n) => {
  if (n.cssautoload)
    try {
      await R({
        id: i.pluginId,
        cssautoload: n.cssautoload,
        csspath: n.csspath,
        debug: n.debug
      });
    } catch (s) {
      console.warn("CSS loading failed, but plugin will continue:", s);
    }
  await C.create(e, n);
}, k = () => new N("demo-plugin", F, q).createInterface();
export {
  k as default
};
