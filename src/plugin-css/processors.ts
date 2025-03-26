import type { PluginCssPaths } from './types';
import { linkAndLoad } from './loaders';

/**
 * Process an array of CSS paths
 */
const tryPaths = async (
  pluginId: string,
  paths: string[],
  context: string,
  debug: boolean
): Promise<boolean> => {
  if (!paths.length) return false;
  
  for (const path of paths) {
    try {
      // Disabled this debug for now
      // debug && console.log(`[${pluginId}] Try ${context}: ${path}`);
      await linkAndLoad(pluginId, path, debug);
      return true;
    } catch (error) {
      debug && console.log(`[${pluginId}] Fail ${context}: ${path}`);
    }
  }
  return false;
};

/**
 * Processes user-specified CSS paths
 */
export const processUserPaths = async (
  pluginId: string, 
  userPath: string | string[] | false,
  debug: boolean
): Promise<boolean> => {
  if (!userPath) return false;
  const paths = Array.isArray(userPath) ? userPath : [userPath];
  return tryPaths(pluginId, paths, 'user', debug);
};

/**
 * Processes developer-specified CSS paths
 */
export const processDeveloperPaths = async (
  pluginId: string,
  devPaths: string | string[] | PluginCssPaths,
  hasNodeModules: boolean,
  debug: boolean
): Promise<boolean> => {
  if (!devPaths) return false;
  
  // Handle different formats of devPaths
  let pathsToTry: string[] = [];
  
  if (typeof devPaths === 'object' && !Array.isArray(devPaths)) {
    // Environment-specific paths
    const envPaths = devPaths as PluginCssPaths;
    
    // Start with environment-specific paths
    if (hasNodeModules && envPaths.npm) {
      const npmPaths = Array.isArray(envPaths.npm) ? envPaths.npm : [envPaths.npm];
      pathsToTry = [...pathsToTry, ...npmPaths];
      debug && console.log(`[${pluginId}] Using npm paths first`);
    }
    
    // Always add standard paths (either as primary or fallback)
    if (envPaths.standard) {
      const standardPaths = Array.isArray(envPaths.standard) ? envPaths.standard : [envPaths.standard];
      pathsToTry = [...pathsToTry, ...standardPaths];
      
      // Only log this if we're not in npm environment
      if (!hasNodeModules || !envPaths.npm) {
        debug && console.log(`[${pluginId}] Using standard paths`);
      } else {
        debug && console.log(`[${pluginId}] Adding standard paths as fallback`);
      }
    }
    
    // Add explicit fallback paths
    if (envPaths.fallback) {
      const fallbackPaths = Array.isArray(envPaths.fallback) ? envPaths.fallback : [envPaths.fallback];
      pathsToTry = [...pathsToTry, ...fallbackPaths];
    }
  } else {
    // Simple string or array of strings
    pathsToTry = Array.isArray(devPaths) ? devPaths : [devPaths as string];
  }
  
  // Try each path in order
  return tryPaths(pluginId, pathsToTry, 'dev', debug);
};