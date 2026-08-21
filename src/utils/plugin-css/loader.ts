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


// Check if CSS is already loaded for a plugin

export const isCssLoaded = (pluginId: string): boolean => {
	const existingLinks = document.querySelectorAll(`[${CSS_ID_ATTR}="${pluginId}"]`);
	return existingLinks.length > 0;
};

/**
 * Backstop for `whenCssImported`, in case a document somehow never fires `load`.
 * Long on purpose: nothing is waiting on the answer, so the only cost of being
 * generous is an advisory arriving late.
*/
const CSS_WAIT_CAP_MS = 10000;

// Checks if CSS has been imported either via link tag or direct import. It includes the isCssLoaded check.

/**
 * Whether the application has already brought this plugin's CSS in, via a link
 * tag we wrote or the `--cssimported-<id>` marker the stylesheet declares.
*/

export const isCssImported = (pluginId: string): Promise<boolean> =>
	Promise.resolve(checkCssImported(pluginId));

/**
 * The same question, but held open until the page has finished settling.
*/

export const whenCssImported = (pluginId: string): Promise<boolean> => {
	return new Promise((resolve) => {

		if (checkCssImported(pluginId)) {
			return resolve(true);
		}

		if (typeof MutationObserver === 'undefined') {
			return resolve(false);
		}

		let settled = false;

		const finish = (result: boolean) => {
			if (settled) return;
			settled = true;
			observer.disconnect();
			clearTimeout(capTimer);
			window.removeEventListener('load', onLoaded);
			resolve(result);
		};

		const recheck = () => {
			if (checkCssImported(pluginId)) finish(true);
		};

		// A stylesheet can be appended anywhere.
		const observer = new MutationObserver(recheck);
		observer.observe(document.documentElement, {
			childList: true,
			subtree: true,
			attributeFilter: ['href', 'rel']
		});

		// `load` waits for stylesheets.
		const onLoaded = () => requestAnimationFrame(() => finish(checkCssImported(pluginId)));

		if (document.readyState === 'complete') {
			onLoaded();
		} else {
			window.addEventListener('load', onLoaded, { once: true });
		}

		const capTimer = setTimeout(() => finish(checkCssImported(pluginId)), CSS_WAIT_CAP_MS);
	});
};

const checkCssImported = (pluginId: string): boolean => {
	// Check for link tag first
	const hasLinkTag = isCssLoaded(pluginId);
	if (hasLinkTag) return true;

	// Get style of root
	try {
		const rootStyle = window.getComputedStyle(document.documentElement);

		// Check for the CSS var
		const customProp = rootStyle.getPropertyValue(`--cssimported-${pluginId}`);

		// Also not empty
		return customProp.trim() !== '';

	} catch (e) {
		return false;
	}
};