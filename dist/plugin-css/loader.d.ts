/**
 * Helper function to load a CSS file via link element
 */
export declare const linkAndLoad: (pluginId: string, path: string, debug: boolean) => Promise<void>;
/**
 * Check if CSS is already loaded for a plugin
 */
export declare const isCssLoaded: (pluginId: string) => boolean;
