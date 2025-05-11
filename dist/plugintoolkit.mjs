var p = Object.defineProperty;
var m = (i, e, t) => e in i ? p(i, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[e] = t;
var s = (i, e, t) => m(i, typeof e != "symbol" ? e + "" : e, t);
import b from "deepmerge";
const y = () => {
  const i = typeof window < "u", e = typeof document < "u", t = i && typeof location < "u" && /localhost|127\.0\.0\.1/.test(location.hostname);
  let o = !1;
  try {
    o = new Function('return typeof module !== "undefined" && !!module.hot')();
  } catch {
  }
  let n = !1;
  try {
    n = new Function('return typeof import.meta !== "undefined" && typeof import.meta.env !== "undefined" && import.meta.env.DEV === true')();
  } catch {
  }
  const l = i && typeof navigator < "u" && /vite|localhost|127\.0\.0\.1/.test(location.origin) && /AppleWebKit|Chrome|Vite/.test(navigator.userAgent), r = e && !!document.querySelector('script[type="module"]');
  let c = !1;
  try {
    c = new Function('return typeof process !== "undefined" && process.env && (process.env.ROLLUP_WATCH === "true" || process.env.NODE_ENV === "development")')();
  } catch {
  }
  let u = !1;
  try {
    u = new Function('return typeof define === "function" && !!define.amd')();
  } catch {
  }
  return {
    isDevServer: t,
    isWebpackHMR: o,
    isVite: n,
    isVitePreview: l,
    hasModuleScripts: r,
    isModuleBundler: c,
    isAMD: u,
    isBundlerEnvironment: o || n || l || r || c || u || t
  };
};
class D {
  // Create a new plugin instance
  constructor(e, t, o) {
    s(this, "defaultConfig");
    s(this, "pluginInit");
    s(this, "pluginId");
    s(this, "mergedConfig", null);
    s(this, "userConfigData", null);
    /** Public data storage for plugin state */
    s(this, "data", {});
    // Gets information about the current JavaScript environment
    s(this, "getEnvironmentInfo", () => y());
    typeof e == "string" ? (this.pluginId = e, this.pluginInit = t, this.defaultConfig = o || {}) : (this.pluginId = e.id, this.pluginInit = e.init, this.defaultConfig = e.defaultConfig || {});
  }
  // Initialize plugin configuration by merging default and user settings
  initializeConfig(e) {
    const t = this.defaultConfig, n = e.getConfig()[this.pluginId] || {};
    this.userConfigData = n, this.mergedConfig = b(t, n, {
      arrayMerge: (l, r) => r,
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
const C = (i) => {
  const e = document.querySelector(
    `script[src$="${i}.js"], script[src$="${i}.min.js"], script[src$="${i}.mjs"]`
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
  return `plugin/${i}/`;
}, g = "data-css-id", S = (i, e) => new Promise((t, o) => {
  const n = document.createElement("link");
  n.rel = "stylesheet", n.href = e, n.setAttribute(g, i);
  const l = setTimeout(() => {
    n.parentNode && n.parentNode.removeChild(n), o(new Error(`[${i}] Timeout loading CSS from: ${e}`));
  }, 5e3);
  n.onload = () => {
    clearTimeout(l), t();
  }, n.onerror = () => {
    clearTimeout(l), n.parentNode && n.parentNode.removeChild(n), o(new Error(`[${i}] Failed to load CSS from: ${e}`));
  }, document.head.appendChild(n);
}), h = (i) => document.querySelectorAll(`[${g}="${i}"]`).length > 0, $ = (i) => new Promise((e) => {
  if (t())
    return e(!0);
  setTimeout(() => {
    e(t());
  }, 50);
  function t() {
    if (h(i)) return !0;
    try {
      return window.getComputedStyle(document.documentElement).getPropertyValue(`--cssimported-${i}`).trim() !== "";
    } catch {
      return !1;
    }
  }
}), f = async (i) => {
  const {
    id: e,
    cssautoload: t = !0,
    csspath: o = "",
    debug: n = !1
  } = i;
  if (t === !1 || o === !1) return;
  if (h(e)) {
    n && console.log(`[${e}] CSS already loaded, skipping`);
    return;
  }
  const l = [];
  typeof o == "string" && o.trim() !== "" && l.push(o);
  const r = C(e);
  if (r) {
    const u = `${r}${e}.css`;
    l.push(u);
  }
  const c = `plugin/${e}/${e}.css`;
  l.push(c);
  for (const u of l)
    try {
      await S(e, u);
      let d = "CSS";
      o && u === o ? d = "user-specified CSS" : r && u === `${r}${e}.css` ? d = "CSS (auto-detected from script location)" : d = "CSS (standard fallback)", n && console.log(`[${e}] ${d} loaded successfully from: ${u}`);
      return;
    } catch {
      n && console.log(`[${e}] Failed to load CSS from: ${u}`);
    }
  console.warn(`[${e}] Could not load CSS from any location`);
};
async function L(i, e) {
  if ("getEnvironmentInfo" in i && e) {
    const t = i, o = t.getEnvironmentInfo();
    if (await $(t.pluginId)) {
      e.debug && console.log(`[${t.pluginId}] CSS already imported, skipping`);
      return;
    }
    if ("cssautoload" in t.userConfig ? !!e.cssautoload : !o.isBundlerEnvironment)
      return f({
        id: t.pluginId,
        cssautoload: !0,
        csspath: e.csspath,
        debug: e.debug
      });
    o.isBundlerEnvironment && console.warn(`[${t.pluginId}] CSS autoloading is disabled in bundler environments. Please import the CSS manually, using import.`);
    return;
  }
  return f(i);
}
class v {
  constructor() {
    // Flag to enable/disable all debugging output
    s(this, "debugMode", !1);
    // Label to prefix all debug messages with
    s(this, "label", "DEBUG");
    // Tracks the current depth of console groups for proper formatting
    s(this, "groupDepth", 0);
    // Creates a new console group and tracks the group depth. 
    // Groups will always display the label prefix in their header.
    s(this, "group", (...e) => {
      this.debugLog("group", ...e), this.groupDepth++;
    });
    // Creates a new collapsed console group and tracks the group depth.
    s(this, "groupCollapsed", (...e) => {
      this.debugLog("groupCollapsed", ...e), this.groupDepth++;
    });
    // Ends the current console group and updates the group depth tracker.
    s(this, "groupEnd", () => {
      this.groupDepth > 0 && (this.groupDepth--, this.debugLog("groupEnd"));
    });
    // Formats and logs an error message with the debug label. 
    // Error messages are always shown, even when debug mode is disabled.
    s(this, "error", (...e) => {
      const t = this.debugMode;
      this.debugMode = !0, this.formatAndLog(console.error, e), this.debugMode = t;
    });
    // Displays a table in the console with the pluginDebug label.
    // Special implementation for console.table to handle tabular data properly.
    // @param messageOrData - Either a message string or the tabular data
    // @param propertiesOrData - Either property names or tabular data (if first param was message)
    // @param optionalProperties - Optional property names (if first param was message)
    s(this, "table", (e, t, o) => {
      if (this.debugMode)
        try {
          typeof e == "string" && t !== void 0 && typeof t != "string" ? (this.groupDepth === 0 ? console.log(`[${this.label}]: ${e}`) : console.log(e), o ? console.table(t, o) : console.table(t)) : (this.groupDepth === 0 && console.log(`[${this.label}]: Table data`), typeof t == "object" && Array.isArray(t) ? console.table(e, t) : console.table(e));
        } catch (n) {
          console.error(`[${this.label}]: Error showing table:`, n), console.log(`[${this.label}]: Raw data:`, e);
        }
    });
    // Helper method that formats and logs messages with the pluginDebug label.
    // @param logMethod - The console method to use for logging
    // @param args - Arguments to pass to the console method
    s(this, "formatAndLog", (e, t) => {
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
    const n = o;
    if (e === "group" || e === "groupCollapsed") {
      t.length > 0 && typeof t[0] == "string" ? n.call(console, `[${this.label}]: ${t[0]}`, ...t.slice(1)) : n.call(console, `[${this.label}]:`, ...t);
      return;
    }
    if (e === "groupEnd") {
      n.call(console);
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
    this.groupDepth > 0 ? n.call(console, ...t) : t.length > 0 && typeof t[0] == "string" ? n.call(console, `[${this.label}]: ${t[0]}`, ...t.slice(1)) : n.call(console, `[${this.label}]:`, ...t);
  }
}
const E = (i) => new Proxy(i, {
  get: (e, t) => {
    if (t in e)
      return e[t];
    const o = t.toString();
    if (typeof console[o] == "function")
      return (...n) => {
        e.debugLog(o, ...n);
      };
  }
}), P = E(new v()), w = (i) => {
  let [e, t] = [0, 0];
  i.on("slidechanged", (o) => {
    const { indexh: n, indexv: l, previousSlide: r, currentSlide: c } = o;
    n !== e && i.dispatchEvent({
      type: "slidechanged-h",
      data: { previousSlide: r, currentSlide: c, indexh: n, indexv: l }
    }), l !== t && n === e && i.dispatchEvent({
      type: "slidechanged-v",
      data: { previousSlide: r, currentSlide: c, indexh: n, indexv: l }
    }), [e, t] = [n, l];
  });
}, M = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  addMoreDirectionEvents: w
}, Symbol.toStringTag, { value: "Module" }));
export {
  D as PluginBase,
  $ as isCssImported,
  L as pluginCSS,
  P as pluginDebug,
  M as pluginTools
};
