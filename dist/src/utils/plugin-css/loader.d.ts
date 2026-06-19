/**
 * Helper function to load a CSS file via link element
 */
export declare const linkAndLoad: (pluginId: string, path: string) => Promise<void>;
export declare const isCssLoaded: (pluginId: string) => boolean;
export declare const isCssImported: (pluginId: string) => Promise<boolean>;
