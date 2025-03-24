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
    // Environment-specific paths object
    if (hasNodeModules && devPaths.npm) {
      pathsToTry = Array.isArray(devPaths.npm) ? devPaths.npm : [devPaths.npm];
      debug && console.log(`[${pluginId}] Using npm paths`);
    } else if (devPaths.standard) {
      pathsToTry = Array.isArray(devPaths.standard) ? devPaths.standard : [devPaths.standard];
      debug && console.log(`[${pluginId}] Using standard paths`);
    }
    
    // Add fallback paths if specified
    if (devPaths.fallback) {
      const fallbacks = Array.isArray(devPaths.fallback) ? devPaths.fallback : [devPaths.fallback];
      pathsToTry = [...pathsToTry, ...fallbacks];
    }
  } else {
    // Simple string or array of strings
    pathsToTry = Array.isArray(devPaths) ? devPaths : [devPaths as string];
  }
  
  return tryPaths(pluginId, pathsToTry, 'dev', debug);
};