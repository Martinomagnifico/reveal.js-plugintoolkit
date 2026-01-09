import T from "deepmerge";
let g = null;
const M = () => {
  if (g) return g;
  const n = typeof window < "u", e = typeof document < "u";
  let t = !1;
  try {
    const r = new Function('return typeof module !== "undefined" && !!module.hot')(), s = new Function('return typeof import.meta !== "undefined" && !!import.meta.hot')();
    t = r || s;
  } catch {
  }
  let o = !1;
  try {
    o = new Function('return typeof import.meta !== "undefined" && import.meta.env?.DEV === true')();
  } catch {
  }
  return g = {
    isDevelopment: t || o,
    hasHMR: t,
    isViteDev: o,
    hasWindow: n,
    hasDocument: e
  }, g;
};
class k {
  defaultConfig;
  pluginInit;
  pluginId;
  mergedConfig = null;
  userConfigData = null;
  /** Public data storage for plugin state */
  data = {};
  // Create a new plugin instance
  constructor(e, t, o) {
    typeof e == "string" ? (this.pluginId = e, this.pluginInit = t, this.defaultConfig = o || {}) : (this.pluginId = e.id, this.pluginInit = e.init, this.defaultConfig = e.defaultConfig || {});
  }
  // Initialize plugin configuration by merging default and user settings
  initializeConfig(e) {
    const t = this.defaultConfig, i = e.getConfig()[this.pluginId] || {};
    this.userConfigData = i, this.mergedConfig = T(t, i, {
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
  getEnvironmentInfo = () => M();
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
const L = (n) => {
  const e = document.querySelector(
    `script[src$="${n}.js"], script[src$="${n}.min.js"], script[src$="${n}.mjs"]`
  );
  if (e?.src) {
    const t = e.getAttribute("src") || "", o = t.lastIndexOf("/");
    if (o !== -1)
      return t.substring(0, o + 1);
  }
  try {
    if (typeof import.meta < "u" && import.meta.url)
      return import.meta.url.slice(0, import.meta.url.lastIndexOf("/") + 1);
  } catch {
  }
  return `plugin/${n}/`;
}, b = "data-css-id", A = (n, e) => new Promise((t, o) => {
  const i = document.createElement("link");
  i.rel = "stylesheet", i.href = e, i.setAttribute(b, n);
  const r = setTimeout(() => {
    i.parentNode && i.parentNode.removeChild(i), o(new Error(`[${n}] Timeout loading CSS from: ${e}`));
  }, 5e3);
  i.onload = () => {
    clearTimeout(r), t();
  }, i.onerror = () => {
    clearTimeout(r), i.parentNode && i.parentNode.removeChild(i), o(new Error(`[${n}] Failed to load CSS from: ${e}`));
  }, document.head.appendChild(i);
}), p = (n) => document.querySelectorAll(`[${b}="${n}"]`).length > 0, D = (n) => new Promise((e) => {
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
  const { id: e, cssautoload: t = !0, csspath: o = "", debug: i = !1 } = n;
  if (t === !1 || o === !1) return;
  if (p(e) && !(typeof o == "string" && o.trim() !== "")) {
    i && console.log(`[${e}] CSS is already loaded, skipping`);
    return;
  }
  p(e) && typeof o == "string" && o.trim() !== "" && i && console.log(`[${e}] CSS is already loaded, also loading user-specified path: ${o}`);
  const r = [];
  typeof o == "string" && o.trim() !== "" && r.push(o);
  const s = L(e);
  if (s) {
    const l = `${s}${e}.css`;
    r.push(l);
  }
  const a = `plugin/${e}/${e}.css`;
  r.push(a);
  for (const l of r)
    try {
      await A(e, l);
      let c = "CSS";
      o && l === o ? c = "user-specified CSS" : s && l === `${s}${e}.css` ? c = "CSS (auto-detected from script location)" : c = "CSS (standard fallback)", i && console.log(`[${e}] ${c} loaded successfully from: ${l}`);
      return;
    } catch {
      i && console.log(`[${e}] Failed to load CSS from: ${l}`);
    }
  console.warn(`[${e}] Could not load CSS from any location`);
};
async function j(n, e) {
  if ("getEnvironmentInfo" in n && e) {
    const t = n, o = t.getEnvironmentInfo();
    if (await D(t.pluginId) && !(typeof e.csspath == "string" && e.csspath.trim() !== "")) {
      e.debug && console.log(`[${t.pluginId}] CSS is already imported, skipping`);
      return;
    }
    if ("cssautoload" in t.userConfig ? !!e.cssautoload : !o.isDevelopment)
      return m({
        id: t.pluginId,
        cssautoload: !0,
        csspath: e.csspath,
        debug: e.debug
      });
    o.isDevelopment && console.warn(
      `[${t.pluginId}] CSS autoloading is disabled in bundler environments. Please import the CSS manually, using import.`
    );
    return;
  }
  return m(n);
}
class x {
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
  table = (e, t, o) => {
    if (this.debugMode)
      try {
        typeof e == "string" && t !== void 0 && typeof t != "string" ? (this.groupDepth === 0 ? console.log(`[${this.label}]: ${e}`) : console.log(e), o ? console.table(t, o) : console.table(t)) : (this.groupDepth === 0 && console.log(`[${this.label}]: Table data`), typeof t == "object" && Array.isArray(t) ? console.table(e, t) : console.table(e));
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
      } catch (o) {
        console.error(`[${this.label}]: Error in logging:`, o), console.log(`[${this.label}]: Original log data:`, ...t);
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
    const o = console[e];
    if (!this.debugMode && e !== "error" || typeof o != "function") return;
    const i = o;
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
const P = (n) => new Proxy(n, {
  get: (e, t) => {
    if (t in e)
      return e[t];
    const o = t.toString();
    if (typeof console[o] == "function")
      return (...i) => {
        e.debugLog(o, ...i);
      };
  }
}), z = P(new x()), h = (n) => {
  let [e, t] = [0, 0];
  n.on("slidechanged", (o) => {
    const { indexh: i, indexv: r, previousSlide: s, currentSlide: a } = o;
    i !== e && n.dispatchEvent({
      type: "slidechanged-h",
      data: { previousSlide: s, currentSlide: a, indexh: i, indexv: r }
    }), r !== t && i === e && n.dispatchEvent({
      type: "slidechanged-v",
      data: { previousSlide: s, currentSlide: a, indexh: i, indexv: r }
    }), [e, t] = [i, r];
  });
}, S = h, C = (n) => {
  const e = n.getViewportElement();
  if (!e)
    return console.warn("[verticator]: Could not find viewport element"), () => {
    };
  const t = () => e.classList.contains("reveal-scroll");
  let o = t(), i = !0;
  const r = new MutationObserver(() => {
    if (!i) return;
    const s = t();
    if (s !== o) {
      const a = n.getCurrentSlide(), l = n.getIndices(), c = l.h, w = l.v, I = s ? "scrollmode-enter" : "scrollmode-exit";
      n.dispatchEvent({
        type: I,
        data: {
          currentSlide: a,
          previousSlide: null,
          indexh: c,
          indexv: w
          // We can add stuff here if needed. Plugin-authors, just ask!
        }
      }), o = s;
    }
  });
  return r.observe(e, { attributes: !0, attributeFilter: ["class"] }), () => {
    i = !1, r.disconnect();
  };
}, H = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  addDirectionEvents: h,
  addMoreDirectionEvents: S,
  addScrollModeEvents: C
}, Symbol.toStringTag, { value: "Module" }));
var y = /* @__PURE__ */ ((n) => (n.HORIZONTAL = "horizontal", n.STACK = "stack", n.VERTICAL = "vertical", n.INVALID = "invalid", n))(y || {});
const u = (n) => n instanceof HTMLElement && n.tagName === "SECTION", d = (n) => u(n) ? Array.from(n.children).some(
  (e) => e instanceof HTMLElement && e.tagName === "SECTION"
) : !1, f = (n) => u(n) ? n.parentElement instanceof HTMLElement && n.parentElement.tagName === "SECTION" : !1, v = (n) => u(n) && !f(n) && !d(n), $ = (n) => {
  if (!u(n)) return null;
  if (f(n)) {
    const e = n.parentElement;
    if (e instanceof HTMLElement && d(e))
      return e;
  }
  return null;
}, E = (n) => u(n) ? f(n) ? "vertical" : d(n) ? "stack" : "horizontal" : "invalid", V = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  SectionType: y,
  getSectionType: E,
  getStack: $,
  isHorizontal: v,
  isSection: u,
  isStack: d,
  isVertical: f
}, Symbol.toStringTag, { value: "Module" })), N = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  addDirectionEvents: h,
  addMoreDirectionEvents: S,
  addScrollModeEvents: C,
  getSectionType: E,
  getStack: $,
  isHorizontal: v,
  isSection: u,
  isStack: d,
  isVertical: f
}, Symbol.toStringTag, { value: "Module" }));
export {
  k as PluginBase,
  H as eventTools,
  D as isCssImported,
  j as pluginCSS,
  z as pluginDebug,
  N as pluginTools,
  V as sectionTools
};
