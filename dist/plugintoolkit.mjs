import I from "deepmerge";
const T = () => {
  const n = typeof window < "u", e = typeof document < "u", t = n && typeof location < "u" && /localhost|127\.0\.0\.1/.test(location.hostname);
  let i = !1;
  try {
    i = new Function('return typeof module !== "undefined" && !!module.hot')();
  } catch {
  }
  let o = !1;
  try {
    o = new Function('return typeof import.meta !== "undefined" && typeof import.meta.env !== "undefined" && import.meta.env.DEV === true')();
  } catch {
  }
  const r = n && typeof navigator < "u" && /vite|localhost|127\.0\.0\.1/.test(location.origin) && /AppleWebKit|Chrome|Vite/.test(navigator.userAgent), s = e && !!document.querySelector('script[type="module"]');
  let c = !1;
  try {
    c = new Function('return typeof process !== "undefined" && process.env && (process.env.ROLLUP_WATCH === "true" || process.env.NODE_ENV === "development")')();
  } catch {
  }
  let l = !1;
  try {
    l = new Function('return typeof define === "function" && !!define.amd')();
  } catch {
  }
  return {
    isDevServer: t,
    isWebpackHMR: i,
    isVite: o,
    isVitePreview: r,
    hasModuleScripts: s,
    isModuleBundler: c,
    isAMD: l,
    isBundlerEnvironment: i || o || r || s || c || l || t
  };
};
class x {
  defaultConfig;
  pluginInit;
  pluginId;
  mergedConfig = null;
  userConfigData = null;
  /** Public data storage for plugin state */
  data = {};
  // Create a new plugin instance
  constructor(e, t, i) {
    typeof e == "string" ? (this.pluginId = e, this.pluginInit = t, this.defaultConfig = i || {}) : (this.pluginId = e.id, this.pluginInit = e.init, this.defaultConfig = e.defaultConfig || {});
  }
  // Initialize plugin configuration by merging default and user settings
  initializeConfig(e) {
    const t = this.defaultConfig, o = e.getConfig()[this.pluginId] || {};
    this.userConfigData = o, this.mergedConfig = I(t, o, {
      arrayMerge: (r, s) => s,
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
  getEnvironmentInfo = () => T();
  // Initialize the plugin
  init(e) {
    if (this.initializeConfig(e), this.pluginInit)
      return this.pluginInit(this, e, this.getCurrentConfig());
  }
  // Create the plugin interface containing all exports
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
const M = (n) => {
  const e = document.querySelector(
    `script[src$="${n}.js"], script[src$="${n}.min.js"], script[src$="${n}.mjs"]`
  );
  if (e?.src) {
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
}, b = "data-css-id", A = (n, e) => new Promise((t, i) => {
  const o = document.createElement("link");
  o.rel = "stylesheet", o.href = e, o.setAttribute(b, n);
  const r = setTimeout(() => {
    o.parentNode && o.parentNode.removeChild(o), i(new Error(`[${n}] Timeout loading CSS from: ${e}`));
  }, 5e3);
  o.onload = () => {
    clearTimeout(r), t();
  }, o.onerror = () => {
    clearTimeout(r), o.parentNode && o.parentNode.removeChild(o), i(new Error(`[${n}] Failed to load CSS from: ${e}`));
  }, document.head.appendChild(o);
}), p = (n) => document.querySelectorAll(`[${b}="${n}"]`).length > 0, L = (n) => new Promise((e) => {
  if (t())
    return e(!0);
  setTimeout(() => {
    e(t());
  }, 50);
  function t() {
    if (p(n)) return !0;
    try {
      return window.getComputedStyle(document.documentElement).getPropertyValue(`--cssimported-${n}`).trim() !== "";
    } catch {
      return !1;
    }
  }
}), m = async (n) => {
  const { id: e, cssautoload: t = !0, csspath: i = "", debug: o = !1 } = n;
  if (t === !1 || i === !1) return;
  if (p(e) && !(typeof i == "string" && i.trim() !== "")) {
    o && console.log(`[${e}] CSS is already loaded, skipping`);
    return;
  }
  p(e) && typeof i == "string" && i.trim() !== "" && o && console.log(`[${e}] CSS is already loaded, also loading user-specified path: ${i}`);
  const r = [];
  typeof i == "string" && i.trim() !== "" && r.push(i);
  const s = M(e);
  if (s) {
    const l = `${s}${e}.css`;
    r.push(l);
  }
  const c = `plugin/${e}/${e}.css`;
  r.push(c);
  for (const l of r)
    try {
      await A(e, l);
      let u = "CSS";
      i && l === i ? u = "user-specified CSS" : s && l === `${s}${e}.css` ? u = "CSS (auto-detected from script location)" : u = "CSS (standard fallback)", o && console.log(`[${e}] ${u} loaded successfully from: ${l}`);
      return;
    } catch {
      o && console.log(`[${e}] Failed to load CSS from: ${l}`);
    }
  console.warn(`[${e}] Could not load CSS from any location`);
};
async function k(n, e) {
  if ("getEnvironmentInfo" in n && e) {
    const t = n, i = t.getEnvironmentInfo();
    if (await L(t.pluginId) && !(typeof e.csspath == "string" && e.csspath.trim() !== "")) {
      e.debug && console.log(`[${t.pluginId}] CSS is already imported, skipping`);
      return;
    }
    if ("cssautoload" in t.userConfig ? !!e.cssautoload : !i.isBundlerEnvironment)
      return m({
        id: t.pluginId,
        cssautoload: !0,
        csspath: e.csspath,
        debug: e.debug
      });
    i.isBundlerEnvironment && console.warn(
      `[${t.pluginId}] CSS autoloading is disabled in bundler environments. Please import the CSS manually, using import.`
    );
    return;
  }
  return m(n);
}
class D {
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
  table = (e, t, i) => {
    if (this.debugMode)
      try {
        typeof e == "string" && t !== void 0 && typeof t != "string" ? (this.groupDepth === 0 ? console.log(`[${this.label}]: ${e}`) : console.log(e), i ? console.table(t, i) : console.table(t)) : (this.groupDepth === 0 && console.log(`[${this.label}]: Table data`), typeof t == "object" && Array.isArray(t) ? console.table(e, t) : console.table(e));
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
      } catch (i) {
        console.error(`[${this.label}]: Error in logging:`, i), console.log(`[${this.label}]: Original log data:`, ...t);
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
const P = (n) => new Proxy(n, {
  get: (e, t) => {
    if (t in e)
      return e[t];
    const i = t.toString();
    if (typeof console[i] == "function")
      return (...o) => {
        e.debugLog(i, ...o);
      };
  }
}), V = P(new D()), h = (n) => {
  let [e, t] = [0, 0];
  n.on("slidechanged", (i) => {
    const { indexh: o, indexv: r, previousSlide: s, currentSlide: c } = i;
    o !== e && n.dispatchEvent({
      type: "slidechanged-h",
      data: { previousSlide: s, currentSlide: c, indexh: o, indexv: r }
    }), r !== t && o === e && n.dispatchEvent({
      type: "slidechanged-v",
      data: { previousSlide: s, currentSlide: c, indexh: o, indexv: r }
    }), [e, t] = [o, r];
  });
}, y = h, S = (n) => {
  const e = n.getViewportElement();
  if (!e)
    return console.warn("[verticator]: Could not find viewport element"), () => {
    };
  const t = () => e.classList.contains("reveal-scroll");
  let i = t(), o = !0;
  const r = new MutationObserver(() => {
    if (!o) return;
    const s = t();
    if (s !== i) {
      const c = n.getCurrentSlide(), l = n.getIndices(), u = l.h, d = l.v, w = s ? "scrollmode-enter" : "scrollmode-exit";
      n.dispatchEvent({
        type: w,
        data: {
          currentSlide: c,
          previousSlide: null,
          indexh: u,
          indexv: d
          // We can add stuff here if needed. Plugin-authors, just ask!
        }
      }), i = s;
    }
  });
  return r.observe(e, { attributes: !0, attributeFilter: ["class"] }), () => {
    o = !1, r.disconnect();
  };
}, j = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  addDirectionEvents: h,
  addMoreDirectionEvents: y,
  addScrollModeEvents: S
}, Symbol.toStringTag, { value: "Module" }));
var C = /* @__PURE__ */ ((n) => (n.HORIZONTAL = "horizontal", n.STACK = "stack", n.VERTICAL = "vertical", n.INVALID = "invalid", n))(C || {});
const a = (n) => n instanceof HTMLElement && n.tagName === "SECTION", f = (n) => a(n) ? Array.from(n.children).some(
  (e) => e instanceof HTMLElement && e.tagName === "SECTION"
) : !1, g = (n) => a(n) ? n.parentElement instanceof HTMLElement && n.parentElement.tagName === "SECTION" : !1, v = (n) => a(n) && !g(n) && !f(n), $ = (n) => {
  if (!a(n)) return null;
  if (g(n)) {
    const e = n.parentElement;
    if (e instanceof HTMLElement && f(e))
      return e;
  }
  return null;
}, E = (n) => a(n) ? g(n) ? "vertical" : f(n) ? "stack" : "horizontal" : "invalid", z = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  SectionType: C,
  getSectionType: E,
  getStack: $,
  isHorizontal: v,
  isSection: a,
  isStack: f,
  isVertical: g
}, Symbol.toStringTag, { value: "Module" })), H = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  addDirectionEvents: h,
  addMoreDirectionEvents: y,
  addScrollModeEvents: S,
  getSectionType: E,
  getStack: $,
  isHorizontal: v,
  isSection: a,
  isStack: f,
  isVertical: g
}, Symbol.toStringTag, { value: "Module" }));
export {
  x as PluginBase,
  j as eventTools,
  L as isCssImported,
  k as pluginCSS,
  V as pluginDebug,
  H as pluginTools,
  z as sectionTools
};
