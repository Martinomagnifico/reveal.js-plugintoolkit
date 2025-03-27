import type { PluginCssOptions } from './plugin-css/types';
import { findPluginScriptPath } from './plugin-css/path-finder';
import { linkAndLoad, isCssLoaded } from './plugin-css/loader';

/**
 * Load CSS for a Reveal.js plugin
 * 
 * @example
 * // Basic usage
 * await pluginCSS({
 *   id: 'my-plugin',                 // Plugin identifier
 *   cssautoload: config.cssautoload, // From user config (default: true)
 *   csspath: config.csspath,         // From user config (default: '')
 *   debug: config.debug              // Enable debug logging (default: false)
 * });
 */
export const pluginCSS = async (options: PluginCssOptions): Promise<void> => {
  const { 
    id, 
    cssautoload = true, 
    csspath = '', 
    debug = false 
  } = options;
  
  // Skip if loading disabled or csspath is explicitly false
  if (cssautoload === false || csspath === false) return;
  
  // Check if already loaded
  if (isCssLoaded(id)) {
    debug && console.log(`[${id}] CSS already loaded, skipping`);
    return;
  }
  
  // Prioritized paths to check
  const paths: string[] = [];
  
  // 1. Add user-specified path (highest priority)
  if (typeof csspath === 'string' && csspath.trim() !== '') {
    paths.push(csspath);
    debug && console.log(`[${id}] Added user-specified path: ${csspath}`);
  }
  
  // 2. Auto-detected path from script location
  const scriptPath = findPluginScriptPath(id);
  if (scriptPath) {
    const autoPath = `${scriptPath}${id}.css`;
    paths.push(autoPath);
    debug && console.log(`[${id}] Added auto-detected path from script location: ${autoPath}`);
  }
  
  // 3. Standard fallback paths
  const standardPath = `plugin/${id}/${id}.css`;
  paths.push(standardPath);
  debug && console.log(`[${id}] Added standard fallback path: ${standardPath}`);
  
  const pluginsPath = `plugins/${id}/${id}.css`;
  paths.push(pluginsPath);
  debug && console.log(`[${id}] Added standard fallback path: ${pluginsPath}`);
  
  // Try each path in order
  for (const path of paths) {
    try {
      debug && console.log(`[${id}] Trying CSS path: ${path}`);
      await linkAndLoad(id, path, debug);
      
      // Determine path type for more informative success message
      let pathType = "CSS";
      
      if (csspath && path === csspath) {
        pathType = "user-specified CSS";
      } else if (scriptPath && path === `${scriptPath}${id}.css`) {
        pathType = "auto-detected script location CSS";
      } else {
        pathType = "standard fallback CSS";
      }
      
      debug && console.log(`[${id}] ${pathType} loaded successfully from: ${path}`);
      return; // Success
    } catch (error) {
      debug && console.log(`[${id}] Failed to load CSS from: ${path}`);
      // Continue to next path
    }
  }
  
  // If we get here, all paths failed
  console.warn(`[${id}] Could not load CSS from any location`);
};

// Re-export types for convenience
export type { PluginCssOptions } from './plugin-css/types';