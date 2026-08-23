import type { PluginBase } from "../../base/plugin-base";
import { warnOnce } from "../plugin-debug";
import { checkCssImported, linkAndLoad, whenCssImported } from "./loader";
import { findPluginSource } from "./path-finder";
import type { PluginCssOptions, PluginCssResult, PluginCssSettings } from "./types";

/**
 * How the plugin's stylesheet got onto the page — or did not.
 *
 * One decision, three inputs:
 *
 *   present     the `--cssimported-<id>` marker, or a link we wrote. Evidence,
 *               read from the page rather than remembered.
 *   wanted      `cssautoload` and `csspath`. What the author asked for.
 *   resolvable  a URL for the plugin's own file, or none. What is possible.
 *
 * Two rules keep it predictable. An explicit `csspath` is an instruction, not a
 * candidate: it is loaded on its own and its failure is never masked by a
 * fallback that happens to work. And silence is only for success — every route
 * that ends without CSS says so, whether or not `debug` is on.
 */

const STANDARD_PATHS = (id: string): string[] => [
	// Reveal 5 and 6 ship plugins under dist/, Reveal 4 at the top level.
	`dist/plugin/${id}/${id}.css`,
	`plugin/${id}/${id}.css`,
];

const isExplicitPath = (csspath: unknown): csspath is string =>
	typeof csspath === "string" && csspath.trim() !== "";

const resolveCss = async (
	id: string,
	settings: PluginCssSettings
): Promise<PluginCssResult> => {
	const { cssautoload, csspath, debug = false } = settings;

	// 1. Turned off. Someone who says so means it, whatever else is set.
	if (cssautoload === false || csspath === false) {
		debug && console.log(`[${id}] CSS loading is switched off`);
		return { status: "skipped" };
	}

	// 2. A path the author named. Loaded on its own: if it fails, that is the
	//    answer, not a reason to quietly fall back to the plugin's defaults.
	if (isExplicitPath(csspath)) {
		const path = csspath.trim();
		try {
			await linkAndLoad(id, path);
			debug && console.log(`[${id}] CSS loaded from: ${path}`);
			return { status: "loaded", path };
		} catch {
			console.warn(`[${id}] Could not load CSS from: ${path}`);
			return { status: "failed", path };
		}
	}

	// 3. Already on the page. Checked after the explicit path, because "some CSS
	//    is present" is not the question an author asking for a file has asked.
	if (checkCssImported(id)) {
		debug && console.log(`[${id}] CSS is already imported, skipping`);
		return { status: "present" };
	}

	// 4. Derive a path from the plugin's own file. `directory: ''` is a real
	//    answer — the file sits beside the page — so only `null` rules this out.
	//    `cssautoload: true` asks for the standard paths to be tried anyway.
	const { directory } = findPluginSource(id);
	const forced = cssautoload === true;

	if (directory !== null || forced) {
		const candidates = [
			...(directory !== null ? [`${directory}${id}.css`] : []),
			...STANDARD_PATHS(id),
		].filter((path, index, all) => all.indexOf(path) === index);

		for (const path of candidates) {
			try {
				await linkAndLoad(id, path);
				debug && console.log(`[${id}] CSS loaded from: ${path}`);
				return { status: "loaded", path };
			} catch {
				debug && console.log(`[${id}] No CSS at: ${path}`);
			}
		}

		console.warn(
			`[${id}] Could not load CSS. Tried: ${candidates.join(", ")}. ` +
				`Import the stylesheet yourself, or set csspath to where it is.`
		);
		return { status: "failed" };
	}

	// 5. No file to resolve against — a bundle, or a dev server that owns the CSS
	//    pipeline itself. Guessing here is a coin flip that costs a 404, so say
	//    what would fix it instead. Deliberately not awaited: a plugin is awaited
	//    by Reveal before the deck is ready, so waiting here would hold up the deck.
	void whenCssImported(id).then((imported) => {
		if (imported) return;
		warnOnce(
			id,
			`CSS could not be autoloaded here, because the plugin is part of a bundle. ` +
				`Import it once in your own code: import 'reveal.js-${id}/${id}.css'`
		);
	});

	return { status: "advised" };
};

/**
 * Put the plugin's stylesheet on the page, or explain why it is not there.
 *
 * Takes either a `PluginBase` and its config, or the 1.0.x options object. Both
 * lead to the same decision — the options form is an adapter, not a second
 * implementation.
 */
export async function pluginCSS<TConfig extends object>(
	firstParam: PluginBase<TConfig> | PluginCssOptions,
	config?: PluginCssSettings
): Promise<PluginCssResult> {
	// Enhanced form: pluginCSS(plugin, config)
	if ("getEnvironmentInfo" in firstParam && config) {
		const plugin = firstParam;

		// `cssautoload` unset and `cssautoload: 'auto'` are the same request:
		// decide for me. Only an explicit true or false overrides that.
		const stated = plugin.userConfig as { cssautoload?: boolean | "auto" };
		const cssautoload =
			"cssautoload" in stated && stated.cssautoload !== "auto"
				? config.cssautoload
				: undefined;

		return resolveCss(plugin.pluginId, { ...config, cssautoload });
	}

	// Options form, kept from 1.0.x.
	const options = firstParam as PluginCssOptions;
	const { id, cssautoload, csspath, debug } = options;
	return resolveCss(id, {
		cssautoload: cssautoload === "auto" ? undefined : cssautoload,
		csspath,
		debug,
	});
}
