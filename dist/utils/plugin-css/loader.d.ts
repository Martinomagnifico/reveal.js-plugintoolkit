/**
 * Helper function to load a CSS file via link element
 */
export declare const linkAndLoad: (pluginId: string, path: string) => Promise<void>;
export declare const isCssLoaded: (pluginId: string) => boolean;
/**
 * Whether the application has already brought this plugin's CSS in, via a link
 * tag we wrote or the `--cssimported-<id>` marker the stylesheet declares.
*/
export declare const isCssImported: (pluginId: string) => Promise<boolean>;
/**
 * The same question, but held open until the page has finished settling.
*/
export declare const whenCssImported: (pluginId: string) => Promise<boolean>;
