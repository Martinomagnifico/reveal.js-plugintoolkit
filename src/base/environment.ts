import type { EnvironmentInfo } from '../types';

let cachedEnv: EnvironmentInfo | null = null;

export const detectEnvironment = (): EnvironmentInfo => {
    if (cachedEnv) return cachedEnv;
    
    const hasWindow = typeof window !== 'undefined';
    const hasDocument = typeof document !== 'undefined';

    // Check for HMR
    let hasHMR = false;
    try {
        const webpackHMR = new Function('return typeof module !== "undefined" && !!module.hot')();
        const viteHMR = new Function('return typeof import.meta !== "undefined" && !!import.meta.hot')();
        hasHMR = webpackHMR || viteHMR;
    } catch (e) {
        // No HMR available
    }
    
    // Check if we're explicitly in Vite dev mode (not preview, not prod)
    let isViteDev = false;
    try {
        isViteDev = new Function('return typeof import.meta !== "undefined" && import.meta.env?.DEV === true')();
    } catch (e) {
        // Not in Vite dev mode
    }
    
    const isDevelopment = hasHMR || isViteDev;
    
    cachedEnv = {
        isDevelopment,
        hasHMR,
        isViteDev,
        hasWindow,
        hasDocument
    };
    
    return cachedEnv;
};