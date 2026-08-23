import type { EnvironmentInfo } from '../types';
import { hasResolvableSource } from '../utils/plugin-css/path-finder';

// webpack injects `module` as a module scoped binding, so it only resolves when
// referenced directly in source. Declared here purely so TypeScript accepts the
// `typeof` guard below; nothing is emitted for it.
declare const module: { hot?: unknown } | undefined;

const cachedEnv = new Map<string, EnvironmentInfo>();

/**
 * What the page can tell us about how this plugin was loaded.
 *
 * Only `hasResolvableSource` decides anything in the toolkit, and it is answered
 * from URLs alone: no bundler-specific globals, so it survives minification, a
 * strict CSP and any output format.
 *
 * The HMR and dev flags below are kept because they are part of the published
 * type, and because a plugin may have its own reason to know. Nothing in the
 * toolkit reads them — they were proxies for "can a path be resolved", and being
 * poor proxies for it is what kept this file changing.
 */
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

    // One try block per probe, so a failing probe cannot discard the result of
    // another.
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

    let isViteDev = false;
    try {
        isViteDev = meta?.env?.DEV === true;
    } catch {
        // Not in Vite dev mode
    }

    const resolvable = pluginId !== '' && hasResolvableSource(pluginId);

    const env: EnvironmentInfo = {
        hasResolvableSource: resolvable,
        hasWindow,
        hasDocument,

        // Deprecated, kept so 1.0.x callers still compile.
        isBundled: !resolvable,
        isDevelopment: hasHMR || isViteDev,
        hasHMR,
        isViteDev
    };

    cachedEnv.set(pluginId, env);

    return env;
};
