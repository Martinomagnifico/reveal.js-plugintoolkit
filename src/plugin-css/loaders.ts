/**
 * Helper function to load a CSS file via link element
 */
export const linkAndLoad = (pluginId: string, path: string, debug: boolean): Promise<void> => {
	return new Promise((resolve, reject) => {
	  const link = document.createElement('link');
	  link.rel = 'stylesheet';
	  link.href = path;
	  link.setAttribute('data-css-id', pluginId);
	  
	  // Set a timeout in case the link never triggers onload or onerror
	  const timeout = setTimeout(() => {
		debug && console.log(`[${pluginId}] Timeout loading CSS from: ${path}`);
		reject(new Error(`Timeout loading CSS from: ${path}`));
	  }, 5000); // 5 second timeout
	  
	  // Success handler
	  link.onload = () => {
		clearTimeout(timeout);
		debug && console.log(`[${pluginId}] CSS loaded from: ${path}`);
		resolve();
	  };
	  
	  // Error handler - create Error but don't log here
	  link.onerror = () => {
		clearTimeout(timeout);
		reject(new Error(`Failed to load CSS from: ${path}`));
	  };
	  
	  document.head.appendChild(link);
	});
  };