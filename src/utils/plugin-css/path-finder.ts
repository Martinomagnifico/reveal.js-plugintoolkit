/**
 * Where was the plugin loaded from?
 *
 * One question, one answer: is there a URL for the plugin's own file, and if so
 * which directory is it in. That is the only thing autoloading needs, and it is
 * deliberately not the same question as "which bundler is this".
 */

// File name suffixes a plugin is shipped under, used both for the script tag
// lookup and for recognising our own file name.
const SCRIPT_SUFFIXES = ['.js', '.min.js', '.mjs'] as const;

/**
 * URL of the file this toolkit code is running inside of, captured while the
 * module is evaluating.
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

/**
 * URL patterns that indicate a file is being served by a dev server. A dev
 * server URL is a real URL, but not one the plugin's stylesheet sits next to —
 * the bundler pipeline owns the CSS there.
 */
const DEV_SERVER_URL_PATTERNS: readonly RegExp[] = [
	// Vite's filesystem escape hatch, for anything outside the project root.
	/\/@fs\//,
	// Vite's resolved-id prefix for virtual and bare module ids.
	/\/@id\//,
	// A pre-bundled dependency. Named after the dependency, not the plugin, so
	// the file name check misses it, but it is worth being explicit.
	/\/\.vite\/deps\//,
	// Cache-busting queries a dev server appends to a module it is watching.
	/[?&][vt]=/,
];

const isDevServerUrl = (url: string): boolean =>
	DEV_SERVER_URL_PATTERNS.some((pattern) => pattern.test(url));

export type PluginSource = {
	/**
	 * Directory the plugin's own file lives in, trailing slash included.
	 *
	 * `''` is a real answer: the file sits in the same directory as the page.
	 * `null` means the plugin could not be traced to a file of its own — it is
	 * part of someone else's bundle, or served by a dev server — and no path can
	 * be derived from it.
	 */
	directory: string | null;
};

/**
 * Work out where the plugin was loaded from.
 */
export const findPluginSource = (pluginId: string): PluginSource => {
	// 1. A script tag naming this plugin: loaded as a classic script.
	if (typeof document !== 'undefined') {
		const selector = SCRIPT_SUFFIXES.map(
			(suffix) => `script[src$="${pluginId}${suffix}"]`
		).join(', ');
		const scriptElement = document.querySelector(selector) as HTMLScriptElement | null;

		// Read the attribute rather than .src, so a relative path stays relative.
		const scriptSrc = scriptElement?.getAttribute('src');
		if (scriptSrc) {
			return { directory: directoryOf(scriptSrc) };
		}
	}

	// 2. Our own file, when it is named after the plugin. Covers a module
	//    imported straight from a folder, with no bundler involved.
	if (selfUrl && !isDevServerUrl(selfUrl) && isPluginFileName(fileNameOf(selfUrl), pluginId)) {
		return { directory: directoryOf(selfUrl) };
	}

	// 3. Neither: nothing to resolve a stylesheet against.
	return { directory: null };
};

/**
 * True when the plugin's own file has a URL, so a stylesheet path can be
 * derived from it rather than guessed at.
 */
export const hasResolvableSource = (pluginId: string): boolean =>
	findPluginSource(pluginId).directory !== null;

/* ------------------------------------------------------------------ *
 * Kept for callers written against 1.0.x.
 * ------------------------------------------------------------------ */

export type PluginScriptSource = {
	directory: string;
	isBundled: boolean;
};

/**
 * @deprecated Use `findPluginSource`. This flattens "same directory as the
 * page" and "unknown" back into `''`, which is the ambiguity the new shape
 * exists to remove.
 */
export const findPluginScriptSource = (pluginId: string): PluginScriptSource => {
	const { directory } = findPluginSource(pluginId);
	return { directory: directory ?? '', isBundled: directory === null };
};

/**
 * @deprecated Use `hasResolvableSource`, which names what is actually tested.
 * The old name says "bundled" where the question is "is there a file to resolve
 * a path against" — a dev server answers no to that too, without being a bundle.
 */
export const isPluginBundled = (pluginId: string): boolean => !hasResolvableSource(pluginId);

/**
 * @deprecated Use `findPluginSource`. Returns the Reveal v5 directory as a guess
 * when the source is unknown, which hides the difference between a derived path
 * and a guessed one.
 */
export const findPluginScriptPath = (pluginId: string): string => {
	const { directory } = findPluginSource(pluginId);
	if (directory) return directory;
	if (directory === '') return '';
	return `dist/plugin/${pluginId}/`;
};
