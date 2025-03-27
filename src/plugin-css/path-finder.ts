/**
 * Find the plugin script path
 */
export const findPluginScriptPath = (pluginId: string): string => {
  // Try to find the script tag with this plugin's filename
  const scriptElement = document.querySelector(
    `script[src$="${pluginId}.js"], script[src$="${pluginId}.min.js"], script[src$="${pluginId}.mjs"]`
  ) as HTMLScriptElement | null;
  
  if (scriptElement?.src) {
    // Extract path from script src attribute
    const scriptSrc = scriptElement.getAttribute("src") || '';
    const lastSlash = scriptSrc.lastIndexOf('/');
    if (lastSlash !== -1) {
      return scriptSrc.substring(0, lastSlash + 1);
    }
  }
  
  // Fallback to import.meta.url if available (for ES modules)
  try {
    if (typeof import.meta !== 'undefined' && import.meta.url) {
      return import.meta.url.slice(0, import.meta.url.lastIndexOf('/') + 1);
    }
  } catch (e) {
    // import.meta.url not available
  }
  
  // Default fallback
  return `plugin/${pluginId}/`;
};