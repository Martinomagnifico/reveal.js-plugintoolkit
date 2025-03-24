/**
 * Environment-specific paths structure
 */
export interface PluginCssPaths {
	npm?: string | string[];       // Paths to try first in npm environments
	standard?: string | string[];  // Paths to try first in standard environments
	fallback?: string | string[];  // Paths to try if environment detection fails
  }
  
  /**
   * Environment detection results
   */
  export interface Environment {
	isDevEnv: boolean;
	isLocalFilesystem: boolean;
	hasNodeModules: boolean;
  }