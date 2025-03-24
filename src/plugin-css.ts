import { 
    isCssLoaded, 
    createDevModeMarker,
    detectEnvironment,
    processUserPaths,
    processDeveloperPaths
  } from './plugin-css/index';
  
import type { PluginCssPaths } from './plugin-css/index';


export interface PluginCssOptions {
    id: string;                       // Required: Plugin identifier
    enableLoading?: boolean;          // Optional: Enable/disable loading (default true)
    userPath?: string | string[] | false; // Optional: User-specified path(s)
    developerPaths?: string | string[] | PluginCssPaths; // Optional: Developer-defined paths
    debug?: boolean;                  // Optional: Enable debug logging (default false)
}

/**
 * Load CSS for a Reveal.js plugin
 * 
 * @example
 * // In plugin initialization code:
 * await pluginCSS({
 *   id: 'my-plugin',                 // Required: Plugin identifier
 *   enableLoading: config.cssautoload, // From user config (default: true)
 *   userPath: config.csspath,        // From user config (default: '')
 *   developerPaths: {                // Developer-defined paths
 *     npm: 'node_modules/my-plugin/dist/my-plugin.css',
 *     standard: 'plugin/my-plugin/my-plugin.css'
 *   },
 *   debug: config.debug              // From user config (default: false)
 * });
 */
export const pluginCSS = async (options: PluginCssOptions): Promise<void> => {
    const { 
        id, 
        enableLoading = true, 
        userPath = '', 
        developerPaths = [], 
        debug = false 
    } = options;
    
    // Skip if loading disabled
    if (enableLoading === false || userPath === false) return;
    
    // Check if already loaded
    if (isCssLoaded(id)) {
        debug && console.log(`[${id}] Already loaded`);
        return;
    }

    // Environment detection
    const env = detectEnvironment();

    // 1. User-specified path(s)
    if (await processUserPaths(id, userPath, debug)) return;
    
    // 2. Dev mode handling
    if (env.isDevEnv) {
        createDevModeMarker(id, debug);
        return;
    }

    // 3. Developer-specified paths
    if (await processDeveloperPaths(id, developerPaths, env.hasNodeModules, debug)) return;
    
    // All paths failed
    console.warn(`[${id}] CSS loading failed. Specify path via csspath.`);
};
  
// Re-export types
export type { PluginCssPaths } from './plugin-css/index';