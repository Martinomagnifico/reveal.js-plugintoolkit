var f = Object.defineProperty;
var h = (i, t, o) => t in i ? f(i, t, { enumerable: !0, configurable: !0, writable: !0, value: o }) : i[t] = o;
var l = (i, t, o) => h(i, typeof t != "symbol" ? t + "" : t, o);
import p from "deepmerge";
class b {
  /**
   * Create a new plugin instance
   * @param idOrOptions Plugin ID string or options object
   * @param init Optional initialization function
   * @param defaultConfig Optional default configuration
   */
  constructor(t, o, n) {
    l(this, "defaultConfig");
    l(this, "pluginInit");
    l(this, "pluginId");
    l(this, "mergedConfig", null);
    /** Public data storage for plugin state */
    l(this, "data", {});
    typeof t == "string" ? (this.pluginId = t, this.pluginInit = o, this.defaultConfig = n || {}) : (this.pluginId = t.id, this.pluginInit = t.init, this.defaultConfig = t.defaultConfig || {});
  }
  /**
   * Initialize plugin configuration by merging default and user settings
   */
  initializeConfig(t) {
    const o = this.defaultConfig, s = t.getConfig()[this.pluginId] || {};
    this.mergedConfig = p(o, s, {
      arrayMerge: (e, r) => r,
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
  init(t) {
    if (this.initializeConfig(t), this.pluginInit)
      return this.pluginInit(this, t, this.getCurrentConfig());
  }
  /**
   * Create the plugin interface containing all exports
   */
  createInterface(t = {}) {
    return {
      id: this.pluginId,
      init: (n) => this.init(n),
      getConfig: () => this.getCurrentConfig(),
      getData: () => this.getData(),
      ...t
    };
  }
}
const C = (i) => {
  const t = document.querySelector(
    `script[src$="${i}.js"], script[src$="${i}.min.js"], script[src$="${i}.mjs"]`
  );
  if (t != null && t.src) {
    const o = t.getAttribute("src") || "", n = o.lastIndexOf("/");
    if (n !== -1)
      return o.substring(0, n + 1);
  }
  try {
    if (typeof import.meta < "u" && import.meta.url)
      return import.meta.url.slice(0, import.meta.url.lastIndexOf("/") + 1);
  } catch {
  }
  return `plugin/${i}/`;
}, g = "data-css-id", m = (i, t, o) => new Promise((n, s) => {
  const e = document.createElement("link");
  e.rel = "stylesheet", e.href = t, e.setAttribute(g, i);
  const r = setTimeout(() => {
    e.parentNode && e.parentNode.removeChild(e), o && console.log(`[${i}] Timeout loading CSS from: ${t}`), s(new Error(`Timeout loading CSS from: ${t}`));
  }, 5e3);
  e.onload = () => {
    clearTimeout(r), n();
  }, e.onerror = () => {
    clearTimeout(r), e.parentNode && e.parentNode.removeChild(e), s(new Error(`Failed to load CSS from: ${t}`));
  }, document.head.appendChild(e);
}), $ = (i) => document.querySelectorAll(`[${g}="${i}"]`).length > 0, I = async (i) => {
  const {
    id: t,
    cssautoload: o = !0,
    csspath: n = "",
    debug: s = !1
  } = i;
  if (o === !1 || n === !1) return;
  if ($(t)) {
    s && console.log(`[${t}] CSS already loaded, skipping`);
    return;
  }
  const e = [];
  typeof n == "string" && n.trim() !== "" && (e.push(n), s && console.log(`[${t}] Added user-specified path: ${n}`));
  const r = C(t);
  if (r) {
    const a = `${r}${t}.css`;
    e.push(a), s && console.log(`[${t}] Added auto-detected path from script location: ${a}`);
  }
  const d = `plugin/${t}/${t}.css`;
  e.push(d), s && console.log(`[${t}] Added standard fallback path: ${d}`);
  const u = `plugins/${t}/${t}.css`;
  e.push(u), s && console.log(`[${t}] Added standard fallback path: ${u}`);
  for (const a of e)
    try {
      s && console.log(`[${t}] Trying CSS path: ${a}`), await m(t, a, s);
      let c = "CSS";
      n && a === n ? c = "user-specified CSS" : r && a === `${r}${t}.css` ? c = "auto-detected script location CSS" : c = "standard fallback CSS", s && console.log(`[${t}] ${c} loaded successfully from: ${a}`);
      return;
    } catch {
      s && console.log(`[${t}] Failed to load CSS from: ${a}`);
    }
  console.warn(`[${t}] Could not load CSS from any location`);
};
export {
  b as PluginBase,
  I as pluginCSS
};
