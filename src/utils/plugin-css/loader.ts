/**
 * CSS ID attribute used for marking loaded CSS files
 */
const CSS_ID_ATTR = 'data-css-id';

/**
 * Helper function to load a CSS file via link element
 */
export const linkAndLoad = (pluginId: string, path: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = path;
    link.setAttribute(CSS_ID_ATTR, pluginId);
    
    // Set a timeout in case the link never triggers onload or onerror
    const timeout = setTimeout(() => {
      // Remove the link element if it times out
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
      reject(new Error(`[${pluginId}] Timeout loading CSS from: ${path}`));
    }, 5000); // 5 second timeout
    
    // Success handler
    link.onload = () => {
      clearTimeout(timeout);
      resolve();
    };
    
    // Error handler
    link.onerror = () => {
      clearTimeout(timeout);
      // Remove the link element if it fails to load
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
      reject(new Error(`[${pluginId}] Failed to load CSS from: ${path}`));
    };
    
    // Add to DOM
    document.head.appendChild(link);
  });
};

/**
 * Check if CSS is already loaded for a plugin
 */
export const isCssLoaded = (pluginId: string): boolean => {
  const existingLinks = document.querySelectorAll(`[${CSS_ID_ATTR}="${pluginId}"]`);
  return existingLinks.length > 0;
};