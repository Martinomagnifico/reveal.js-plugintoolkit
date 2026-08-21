/**
 * Find the plugin script path
 */
export type PluginScriptSource = {
    /** Directory the plugin's own file lives in, trailing slash included. Empty when unknown. */
    directory: string;
    /** True when the plugin could not be traced back to a file of its own, so it is part of someone else's bundle. */
    isBundled: boolean;
};
/**
 * Work out where the plugin was loaded from, and whether it was loaded as a file at all.
 */
export declare const findPluginScriptSource: (pluginId: string) => PluginScriptSource;
/**
 * True when the plugin is part of an application bundle rather than a file of its own.
 */
export declare const isPluginBundled: (pluginId: string) => boolean;
export declare const findPluginScriptPath: (pluginId: string) => string;
