/**
 * Find the plugin script path
 */

// File name suffixes a plugin is shipped under, used both for the script tag
// lookup and for recognising our own file name.
const SCRIPT_SUFFIXES = ['.js', '.min.js', '.mjs'] as const;

/**
 * URL of the file this toolkit code is running inside of, captured while the
 * module is evaluating.
 *
 * `import.meta.url` cannot be reached through `new Function('return import.meta')`:
 * the function body is always parsed in non-module goal, so the constructor throws
 * a SyntaxError at parse time, in every environment. It has to be referenced
 * directly so each output format can deal with it:
 *
 * - ESM output keeps `import.meta.url` as written.
 * - Non-ESM output (UMD) has the bundler replace `import.meta` with `{}`, so the
 *   url is undefined there and `document.currentScript` stands in. That is only
 *   readable while the script is evaluating, hence the module level capture.
 */
const selfUrl: string = (() => {
	const meta = import.meta as { url?: string } | undefined;
	if (typeof meta?.url === 'string' && meta.url !== '') return meta.url;

	// No `instanceof HTMLScriptElement` here: outside a browser that constructor
	// is not declared at all, and the ReferenceError would break module evaluation.
	const current = typeof document !== 'undefined' ? document.currentScript : null;
	if (current && 'src' in current && current.src) return current.src;

	return '';
})();

const directoryOf = (url: string): string => {
	const lastSlash = url.lastIndexOf('/');
	return lastSlash === -1 ? '' : url.slice(0, lastSlash + 1);
};

const fileNameOf = (url: string): string => {
	const path = url.split(/[?#]/)[0];
	return path.slice(path.lastIndexOf('/') + 1);
};

const isPluginFileName = (fileName: string, pluginId: string): boolean =>
	SCRIPT_SUFFIXES.some((suffix) => fileName === `${pluginId}${suffix}`);

export type PluginScriptSource = {
	/** Directory the plugin's own file lives in, trailing slash included. Empty when unknown. */
	directory: string;
	/** True when the plugin could not be traced back to a file of its own, so it is part of someone else's bundle. */
	isBundled: boolean;
};

/**
 * Work out where the plugin was loaded from, and whether it was loaded as a
 * discrete file at all.
 */
export const findPluginScriptSource = (pluginId: string): PluginScriptSource => {
	// 1. A script tag naming this plugin: loaded as a classic script.
	if (typeof document !== 'undefined') {
		const selector = SCRIPT_SUFFIXES.map(
			(suffix) => `script[src$="${pluginId}${suffix}"]`
		).join(', ');
		const scriptElement = document.querySelector(selector) as HTMLScriptElement | null;

		// Read the attribute rather than .src, so a relative path stays relative.
		const scriptSrc = scriptElement?.getAttribute('src');
		if (scriptSrc) {
			return { directory: directoryOf(scriptSrc), isBundled: false };
		}
	}

	// 2. Our own file, when it is named after the plugin. A discrete ES module
	//    import (`import Plugin from './plugin.mjs'`) leaves no script tag behind,
	//    so this is the only signal for that way of loading.
	if (selfUrl && isPluginFileName(fileNameOf(selfUrl), pluginId)) {
		return { directory: directoryOf(selfUrl), isBundled: false };
	}

	// 3. Neither: the plugin was rolled into an application bundle, whose file is
	//    named after the application and carries no CSS we can guess the path of.
	return { directory: '', isBundled: true };
};

/**
 * True when the plugin is part of an application bundle rather than a file of its own.
 */
export const isPluginBundled = (pluginId: string): boolean =>
	findPluginScriptSource(pluginId).isBundled;

export const findPluginScriptPath = (pluginId: string): string => {
	const { directory } = findPluginScriptSource(pluginId);
	if (directory) return directory;

	// Default fallback - use Reveal.js v5 path
	// The CSS loader will try v4 path as secondary fallback
	return `dist/plugin/${pluginId}/`;
};
