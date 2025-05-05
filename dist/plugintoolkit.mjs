var p = Object.defineProperty;
var m = (i, e, t) => e in i ? p(i, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[e] = t;
var l = (i, e, t) => m(i, typeof e != "symbol" ? e + "" : e, t);
import b from "deepmerge";
const y = () => {
  const i = typeof window < "u", e = typeof document < "u", t = i && typeof location < "u" && /localhost|127\.0\.0\.1/.test(location.hostname);
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
  const s = i && typeof navigator < "u" && /vite|localhost|127\.0\.0\.1/.test(location.origin) && /AppleWebKit|Chrome|Vite/.test(navigator.userAgent), u = e && !!document.querySelector('script[type="module"]');
  let d = !1;
  try {
    d = new Function('return typeof process !== "undefined" && process.env && (process.env.ROLLUP_WATCH === "true" || process.env.NODE_ENV === "development")')();
  } catch {
  }
  let r = !1;
  try {
    r = new Function('return typeof define === "function" && !!define.amd')();
  } catch {
  }
  return {
    isDevServer: t,
    isWebpackHMR: n,
    isVite: o,
    isVitePreview: s,
    hasModuleScripts: u,
    isModuleBundler: d,
    isAMD: r,
    isBundlerEnvironment: n || o || s || u || d || r || t
  };
};
class I {
  // Create a new plugin instance
  constructor(e, t, n) {
    l(this, "defaultConfig");
    l(this, "pluginInit");
    l(this, "pluginId");
    l(this, "mergedConfig", null);
    l(this, "userConfigData", null);
    /** Public data storage for plugin state */
    l(this, "data", {});
    // Gets information about the current JavaScript environment
    l(this, "getEnvironmentInfo", () => y());
    typeof e == "string" ? (this.pluginId = e, this.pluginInit = t, this.defaultConfig = n || {}) : (this.pluginId = e.id, this.pluginInit = e.init, this.defaultConfig = e.defaultConfig || {});
  }
  // Initialize plugin configuration by merging default and user settings
  initializeConfig(e) {
    const t = this.defaultConfig, o = e.getConfig()[this.pluginId] || {};
    this.userConfigData = o, this.mergedConfig = b(t, o, {
      arrayMerge: (s, u) => u,
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
      init: (n) => this.init(n),
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
    const t = e.getAttribute("src") || "", n = t.lastIndexOf("/");
    if (n !== -1)
      return t.substring(0, n + 1);
  }
  try {
    if (typeof import.meta < "u" && import.meta.url)
      return import.meta.url.slice(0, import.meta.url.lastIndexOf("/") + 1);
  } catch {
  }
  return `plugin/${i}/`;
}, g = "data-css-id", S = (i, e) => new Promise((t, n) => {
  const o = document.createElement("link");
  o.rel = "stylesheet", o.href = e, o.setAttribute(g, i);
  const s = setTimeout(() => {
    o.parentNode && o.parentNode.removeChild(o), n(new Error(`[${i}] Timeout loading CSS from: ${e}`));
  }, 5e3);
  o.onload = () => {
    clearTimeout(s), t();
  }, o.onerror = () => {
    clearTimeout(s), o.parentNode && o.parentNode.removeChild(o), n(new Error(`[${i}] Failed to load CSS from: ${e}`));
  }, document.head.appendChild(o);
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
    csspath: n = "",
    debug: o = !1
  } = i;
  if (t === !1 || n === !1) return;
  if (h(e)) {
    o && console.log(`[${e}] CSS already loaded, skipping`);
    return;
  }
  const s = [];
  typeof n == "string" && n.trim() !== "" && s.push(n);
  const u = C(e);
  if (u) {
    const r = `${u}${e}.css`;
    s.push(r);
  }
  const d = `plugin/${e}/${e}.css`;
  s.push(d);
  for (const r of s)
    try {
      await S(e, r);
      let c = "CSS";
      n && r === n ? c = "user-specified CSS" : u && r === `${u}${e}.css` ? c = "CSS (auto-detected from script location)" : c = "CSS (standard fallback)", o && console.log(`[${e}] ${c} loaded successfully from: ${r}`);
      return;
    } catch {
      o && console.log(`[${e}] Failed to load CSS from: ${r}`);
    }
  console.warn(`[${e}] Could not load CSS from any location`);
};
async function D(i, e) {
  if ("getEnvironmentInfo" in i && e) {
    const t = i, n = t.getEnvironmentInfo();
    if (await $(t.pluginId)) {
      e.debug && console.log(`[${t.pluginId}] CSS already imported, skipping`);
      return;
    }
    if ("cssautoload" in t.userConfig ? !!e.cssautoload : !n.isBundlerEnvironment)
      return f({
        id: t.pluginId,
        cssautoload: !0,
        csspath: e.csspath,
        debug: e.debug
      });
    n.isBundlerEnvironment && console.warn(`[${t.pluginId}] CSS autoloading is disabled in bundler environments. Please import the CSS manually, using import.`);
    return;
  }
  return f(i);
}
class v {
  constructor() {
    // Flag to enable/disable all debugging output
    l(this, "debugMode", !1);
    // Label to prefix all debug messages with
    l(this, "label", "DEBUG");
    // Tracks the current depth of console groups for proper formatting
    l(this, "groupDepth", 0);
    // Creates a new console group and tracks the group depth. 
    // Groups will always display the label prefix in their header.
    l(this, "group", (...e) => {
      this.debugLog("group", ...e), this.groupDepth++;
    });
    // Creates a new collapsed console group and tracks the group depth.
    l(this, "groupCollapsed", (...e) => {
      this.debugLog("groupCollapsed", ...e), this.groupDepth++;
    });
    // Ends the current console group and updates the group depth tracker.
    l(this, "groupEnd", () => {
      this.groupDepth > 0 && (this.groupDepth--, this.debugLog("groupEnd"));
    });
    // Formats and logs an error message with the debug label. 
    // Error messages are always shown, even when debug mode is disabled.
    l(this, "error", (...e) => {
      const t = this.debugMode;
      this.debugMode = !0, this.formatAndLog(console.error, e), this.debugMode = t;
    });
    // Displays a table in the console with the pluginDebug label.
    // Special implementation for console.table to handle tabular data properly.
    // @param messageOrData - Either a message string or the tabular data
    // @param propertiesOrData - Either property names or tabular data (if first param was message)
    // @param optionalProperties - Optional property names (if first param was message)
    l(this, "table", (e, t, n) => {
      if (this.debugMode)
        try {
          typeof e == "string" && t !== void 0 && typeof t != "string" ? (this.groupDepth === 0 ? console.log(`[${this.label}]: ${e}`) : console.log(e), n ? console.table(t, n) : console.table(t)) : (this.groupDepth === 0 && console.log(`[${this.label}]: Table data`), typeof t == "object" && Array.isArray(t) ? console.table(e, t) : console.table(e));
        } catch (o) {
          console.error(`[${this.label}]: Error showing table:`, o), console.log(`[${this.label}]: Raw data:`, e);
        }
    });
    // Helper method that formats and logs messages with the pluginDebug label.
    // @param logMethod - The console method to use for logging
    // @param args - Arguments to pass to the console method
    l(this, "formatAndLog", (e, t) => {
      if (this.debugMode)
        try {
          this.groupDepth > 0 ? e.call(console, ...t) : t.length > 0 && typeof t[0] == "string" ? e.call(console, `[${this.label}]: ${t[0]}`, ...t.slice(1)) : e.call(console, `[${this.label}]:`, ...t);
        } catch (n) {
          console.error(`[${this.label}]: Error in logging:`, n), console.log(`[${this.label}]: Original log data:`, ...t);
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
const w = (i) => new Proxy(i, {
  get: (e, t) => {
    if (t in e)
      return e[t];
    const n = t.toString();
    if (typeof console[n] == "function")
      return (...o) => {
        e.debugLog(n, ...o);
      };
  }
}), L = w(new v());
export {
  I as PluginBase,
  $ as isCssImported,
  D as pluginCSS,
  L as pluginDebug
};
