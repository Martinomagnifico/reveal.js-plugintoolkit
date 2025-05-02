// First, let's create a clean environment detection function that avoids TypeScript errors

export const detectEnvironment = () => {
    // Basic environment checks
    const hasWindow = typeof window !== 'undefined';
    const hasDocument = typeof document !== 'undefined';
    
    // Check for development server (localhost)
    const isDevServer = hasWindow && 
                      typeof location !== 'undefined' && 
                      /localhost|127\.0\.0\.1/.test(location.hostname);
    
    // Check for various bundler environments, using try/catch to avoid TypeScript errors
    
    // Webpack HMR check
    let isWebpackHMR = false;
    try {
        // Use Function constructor to avoid TypeScript errors
        isWebpackHMR = new Function('return typeof module !== "undefined" && !!module.hot')();
    } catch (e) {
        // Not webpack HMR
    }
    
    // Vite check
    let isVite = false;
    try {
        isVite = new Function('return typeof import.meta !== "undefined" && typeof import.meta.env !== "undefined" && import.meta.env.DEV === true')();
    } catch (e) {
        // Not Vite
    }
    
    // Vite preview detection
    const isVitePreview = hasWindow && 
                        typeof navigator !== 'undefined' && 
                        /vite|localhost|127\.0\.0\.1/.test(location.origin) && 
                        /AppleWebKit|Chrome|Vite/.test(navigator.userAgent);
    
    // Check for script type="module"
    const hasModuleScripts = hasDocument && 
                           !!document.querySelector('script[type="module"]');
    
    // Module bundler check
    let isModuleBundler = false;
    try {
        isModuleBundler = new Function('return typeof process !== "undefined" && process.env && (process.env.ROLLUP_WATCH === "true" || process.env.NODE_ENV === "development")')();
    } catch (e) {
        // Not a module bundler
    }
    
    // AMD/RequireJS check
    let isAMD = false;
    try {
        isAMD = new Function('return typeof define === "function" && !!define.amd')();
    } catch (e) {
        // Not AMD
    }
    
    // Is this a bundler environment?
    const isBundlerEnvironment = isWebpackHMR || 
                              isVite || 
                              isVitePreview || 
                              hasModuleScripts || 
                              isModuleBundler || 
                              isAMD || 
                              isDevServer;

    return {
        isDevServer,
        isWebpackHMR,
        isVite,
        isVitePreview,
        hasModuleScripts,
        isModuleBundler,
        isAMD,
        isBundlerEnvironment
    };
};