import type { PluginCssOptions } from './plugin-css/types';
/**
 * Load CSS for a Reveal.js plugin
 *
 * @example
 * // Basic usage
 * await pluginCSS({
 *   id: 'my-plugin',                 // Plugin identifier
 *   cssautoload: config.cssautoload, // From user config (default: true)
 *   csspath: config.csspath,         // From user config (default: '')
 *   debug: config.debug              // Enable debug logging (default: false)
 * });
 */
export declare const pluginCSS: (options: PluginCssOptions) => Promise<void>;
export type { PluginCssOptions } from './plugin-css/types';
