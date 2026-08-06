import type { EnvironmentInfo } from '../types';
import { isPluginBundled } from '../utils/plugin-css/path-finder';

// webpack injects `module` as a module scoped binding, so it only resolves when
// referenced directly in source. Declared here purely so TypeScript accepts the
// `typeof` guard below; nothing is emitted for it.
declare const module: { hot?: unknown } | undefined;

const cachedEnv = new Map<string, EnvironmentInfo>();

export const detectEnvironment = (pluginId = ''): EnvironmentInfo => {
    const cached = cachedEnv.get(pluginId);
    if (cached) return cached;

    const hasWindow = typeof window !== 'undefined';
    const hasDocument = typeof document !== 'undefined';

    // Both HMR flags have to name `import.meta` / `module` directly. A bundler
    // cannot see into a string literal, and `Function('return import.meta')`
    // throws a SyntaxError at parse time in every environment, taking any other
    // probe that shares its try block down with it.
    const meta = import.meta as { hot?: unknown; env?: { DEV?: boolean } } | undefined;

    // Check for HMR. One try block per probe, so a failing probe cannot discard
    // the result of another.
    let webpackHMR = false;
    try {
        webpackHMR = typeof module !== 'undefined' && !!module?.hot;
    } catch {
        // No webpack HMR available
    }

    let viteHMR = false;
    try {
        viteHMR = !!meta?.hot;
    } catch {
        // No Vite HMR available
    }

    const hasHMR = webpackHMR || viteHMR;

    // Check if we're explicitly in Vite dev mode (not preview, not prod)
    let isViteDev = false;
    try {
        isViteDev = meta?.env?.DEV === true;
    } catch {
        // Not in Vite dev mode
    }

    const isDevelopment = hasHMR || isViteDev;

    // Whether this plugin is part of an application bundle rather than a file of
    // its own. Unlike the HMR flags this needs no bundler-specific globals, so it
    // survives minification, a strict CSP and any output format.
    const isBundled = pluginId !== '' && isPluginBundled(pluginId);

    const env: EnvironmentInfo = {
        isDevelopment,
        hasHMR,
        isViteDev,
        isBundled,
        hasWindow,
        hasDocument
    };

    cachedEnv.set(pluginId, env);

    return env;
};
