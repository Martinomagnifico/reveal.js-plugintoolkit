import type { PluginCssOptions } from "./types";
import type { PluginBase } from "../../base/plugin-base";
import { findPluginScriptPath } from "./path-finder";
import { linkAndLoad, isCssLoaded, isCssImported } from "./loader";

// Keep original function as internal
const pluginCSS_original = async (options: PluginCssOptions): Promise<void> => {
	const { id, cssautoload = true, csspath = "", debug = false } = options;

	// Skip if loading disabled or csspath is explicitly false
	if (cssautoload === false || csspath === false) return;

	// Check if already loaded
	if ( isCssLoaded(id) && !(typeof csspath === "string" && csspath.trim() !== "")) {
		debug && console.log(`[${id}] CSS is already loaded, skipping`);
		return;
	}
	if ( isCssLoaded(id) && (typeof csspath === "string" && csspath.trim() !== "")) {
		debug && console.log(`[${id}] CSS is already loaded, also loading user-specified path: ${csspath}`);
	}

	// Prioritized paths to check
	const paths: string[] = [];

	// 1. Add user-specified path (highest priority)
	if (typeof csspath === "string" && csspath.trim() !== "") {
		paths.push(csspath);
	}

	// 2. Auto-detected path from script location
	const scriptPath = findPluginScriptPath(id);
	if (scriptPath) {
		const autoPath = `${scriptPath}${id}.css`;
		paths.push(autoPath);
	}

	// 3. Standard fallback paths
	const standardPath = `plugin/${id}/${id}.css`;
	paths.push(standardPath);

	// Try each path in order
	for (const path of paths) {
		try {
			await linkAndLoad(id, path);

			// Determine path type for more informative success message
			let pathType = "CSS";

			if (csspath && path === csspath) {
				pathType = "user-specified CSS";
			} else if (scriptPath && path === `${scriptPath}${id}.css`) {
				pathType = "CSS (auto-detected from script location)";
			} else {
				pathType = "CSS (standard fallback)";
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

export async function pluginCSS<TConfig extends object>(
	firstParam: PluginBase<TConfig> | PluginCssOptions,
	config?: {
		cssautoload?: boolean;
		csspath?: string | false;
		debug?: boolean;
	},
): Promise<void> {
	// Enhanced mode - if first param is a PluginBase instance
	if ("getEnvironmentInfo" in firstParam && config) {
		const plugin = firstParam;

		// Let's add some debugging here
		const env = plugin.getEnvironmentInfo();

		// Check for existing CSS first
		const cssAlreadyImported = await isCssImported(plugin.pluginId);

		if ( cssAlreadyImported && !(typeof config.csspath === "string" && config.csspath.trim() !== "") ) {
			config.debug &&
				console.log(`[${plugin.pluginId}] CSS is already imported, skipping`);
			return;
		}

		const cssAutoloadExplicitlySet = "cssautoload" in plugin.userConfig;

		const shouldAutoloadCSS = cssAutoloadExplicitlySet
			? !!config.cssautoload
			: !env.isDevelopment;

		if (shouldAutoloadCSS) {
			// Call original pluginCSS
			return pluginCSS_original({
				id: plugin.pluginId,
				cssautoload: true,
				csspath: config.csspath,
				debug: config.debug,
			});
		}

		if (env.isDevelopment) {
			// Show warning about manual import
			console.warn(
				`[${plugin.pluginId}] CSS autoloading is disabled in bundler environments. Please import the CSS manually, using import.`,
			);
		}
		return;
	}

	// Legacy mode
	return pluginCSS_original(firstParam as PluginCssOptions);
}
