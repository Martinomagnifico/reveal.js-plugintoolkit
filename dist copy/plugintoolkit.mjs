var h = Object.defineProperty;
var d = (n, e, t) => e in n ? h(n, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[e] = t;
var l = (n, e, t) => d(n, typeof e != "symbol" ? e + "" : e, t);
import a from "deepmerge";
class w {
  /**
   * Create a new plugin instance
   */
  constructor(e, t, i) {
    l(this, "defaultConfig");
    l(this, "pluginInit");
    l(this, "pluginId");
    l(this, "mergedConfig", null);
    /** Public data storage for plugin state */
    l(this, "data", {});
    typeof e == "string" ? (this.pluginId = e, this.pluginInit = t, this.defaultConfig = i || {}) : (this.pluginId = e.id, this.pluginInit = e.init, this.defaultConfig = e.defaultConfig || {});
  }
  /**
   * Initialize plugin configuration by merging default and user settings
   */
  initializeConfig(e) {
    const t = this.defaultConfig, o = e.getConfig()[this.pluginId] || {};
    this.mergedConfig = a(t, o, {
      arrayMerge: (s, c) => c,
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
const p = (n) => {
  const e = document.querySelector(
    `script[src$="${n}.js"], script[src$="${n}.min.js"], script[src$="${n}.mjs"]`
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
  return `plugin/${n}/`;
}, f = "data-css-id", b = (n, e) => new Promise((t, i) => {
  const o = document.createElement("link");
  o.rel = "stylesheet", o.href = e, o.setAttribute(f, n);
  const s = setTimeout(() => {
    o.parentNode && o.parentNode.removeChild(o), i(new Error(`[${n}] Timeout loading CSS from: ${e}`));
  }, 5e3);
  o.onload = () => {
    clearTimeout(s), t();
  }, o.onerror = () => {
    clearTimeout(s), o.parentNode && o.parentNode.removeChild(o), i(new Error(`[${n}] Failed to load CSS from: ${e}`));
  }, document.head.appendChild(o);
}), C = (n) => document.querySelectorAll(`[${f}="${n}"]`).length > 0, L = async (n) => {
  const {
    id: e,
    cssautoload: t = !0,
    csspath: i = "",
    debug: o = !1
  } = n;
  if (t === !1 || i === !1) return;
  if (C(e)) {
    o && console.log(`[${e}] CSS already loaded, skipping`);
    return;
  }
  const s = [];
  typeof i == "string" && i.trim() !== "" && s.push(i);
  const c = p(e);
  if (c) {
    const r = `${c}${e}.css`;
    s.push(r);
  }
  const g = `plugin/${e}/${e}.css`;
  s.push(g);
  for (const r of s)
    try {
      await b(e, r);
      let u = "CSS";
      i && r === i ? u = "user-specified CSS" : c && r === `${c}${e}.css` ? u = "CSS (auto-detected from script location)" : u = "CSS (standard fallback)", o && console.log(`[${e}] ${u} loaded successfully from: ${r}`);
      return;
    } catch {
      o && console.log(`[${e}] Failed to load CSS from: ${r}`);
    }
  console.warn(`[${e}] Could not load CSS from any location`);
};
class $ {
  constructor() {
    /** Flag to enable/disable all debugging output */
    l(this, "debugMode", !1);
    /** Label to prefix all debug messages with */
    l(this, "label", "DEBUG");
    /** Tracks the current depth of console groups for proper formatting */
    l(this, "groupDepth", 0);
    /**
     * Creates a new console group and tracks the group depth.
     * Groups will always display the label prefix in their header.
     * 
     * @param args - Arguments to pass to console.group
     */
    l(this, "group", (...e) => {
      this.debugLog("group", ...e), this.groupDepth++;
    });
    /**
     * Creates a new collapsed console group and tracks the group depth.
     * 
     * @param args - Arguments to pass to console.groupCollapsed
     */
    l(this, "groupCollapsed", (...e) => {
      this.debugLog("groupCollapsed", ...e), this.groupDepth++;
    });
    /**
     * Ends the current console group and updates the group depth tracker.
     */
    l(this, "groupEnd", () => {
      this.groupDepth > 0 && (this.groupDepth--, this.debugLog("groupEnd"));
    });
    /**
     * Formats and logs an error message with the debug label.
     * Error messages are always shown, even when debug mode is disabled.
     * 
     * @param args - Arguments to pass to console.error
     */
    l(this, "error", (...e) => {
      const t = this.debugMode;
      this.debugMode = !0, this.formatAndLog(console.error, e), this.debugMode = t;
    });
    /**
     * Displays a table in the console with the pluginDebug label.
     * Special implementation for console.table to handle tabular data properly.
     * 
     * @param messageOrData - Either a message string or the tabular data
     * @param propertiesOrData - Either property names or tabular data (if first param was message)
     * @param optionalProperties - Optional property names (if first param was message)
     */
    l(this, "table", (e, t, i) => {
      if (this.debugMode)
        try {
          typeof e == "string" && t !== void 0 && typeof t != "string" ? (this.groupDepth === 0 ? console.log(`[${this.label}]: ${e}`) : console.log(e), i ? console.table(t, i) : console.table(t)) : (this.groupDepth === 0 && console.log(`[${this.label}]: Table data`), typeof t == "object" && Array.isArray(t) ? console.table(e, t) : console.table(e));
        } catch (o) {
          console.error(`[${this.label}]: Error showing table:`, o), console.log(`[${this.label}]: Raw data:`, e);
        }
    });
    /**
     * Helper method that formats and logs messages with the pluginDebug label.
     * 
     * @param logMethod - The console method to use for logging
     * @param args - Arguments to pass to the console method
     */
    l(this, "formatAndLog", (e, t) => {
      if (this.debugMode)
        try {
          this.groupDepth > 0 ? e.call(console, ...t) : t.length > 0 && typeof t[0] == "string" ? e.call(console, `[${this.label}]: ${t[0]}`, ...t.slice(1)) : e.call(console, `[${this.label}]:`, ...t);
        } catch (i) {
          console.error(`[${this.label}]: Error in logging:`, i), console.log(`[${this.label}]: Original log data:`, ...t);
        }
    });
  }
  /**
   * Initializes the debug utility with custom settings.
   * 
   * @param isDebug - Whether debug output should be enabled
   * @param label - Custom label to prefix all debug messages with
   */
  initialize(e, t = "DEBUG") {
    this.debugMode = e, this.label = t;
  }
  /**
   * Core method that handles calling console methods with proper formatting.
   * - Adds label prefix to messages outside of groups
   * - Skips label prefix for messages inside groups to avoid redundancy
   * - Always adds label prefix to group headers
   * - Error messages are always shown regardless of debug mode
   * 
   * @param methodName - Name of the console method to call
   * @param args - Arguments to pass to the console method
   */
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
function y(n) {
  return new Proxy(n, {
    get: (e, t) => {
      if (t in e)
        return e[t];
      const i = t.toString();
      if (typeof console[i] == "function")
        return (...o) => {
          e.debugLog(i, ...o);
        };
    }
  });
}
const E = y(new $());
export {
  w as PluginBase,
  L as pluginCSS,
  E as pluginDebug
};
