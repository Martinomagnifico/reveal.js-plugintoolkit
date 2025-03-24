import type { Environment } from './types';

/**
 * Detects the current environment characteristics
 */
export const detectEnvironment = (): Environment => {
  const isModuleEnv = typeof import.meta !== 'undefined';
  const envObject = isModuleEnv ? (import.meta as {env?: {DEV?: boolean}}).env : undefined;

  return {
    isDevEnv: !!envObject?.DEV,
    isLocalFilesystem: window.location.protocol === 'file:',
    hasNodeModules: !!document.querySelector('[src*="node_modules/"],[href*="node_modules/"]')
  };
};


/**
 * Checks if CSS is already loaded for a plugin
 */
export const isCssLoaded = (pluginId: string): boolean => {
  return !!document.querySelector(`[data-css-id="${pluginId}"]`);
};

/**
 * Creates a marker to indicate CSS is loaded in dev mode
 */
export const createDevModeMarker = (pluginId: string, debug: boolean): void => {
  const marker = document.createElement('style');
  marker.setAttribute('data-css-id', pluginId);
  marker.textContent = '/* CSS loaded via import */';
  document.head.appendChild(marker);
  
  if (debug) console.log("Development CSS handled via import");
};