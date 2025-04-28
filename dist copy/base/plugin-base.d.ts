import { Api as RevealApi } from 'reveal.js';
export type RevealInstance = RevealApi;
/**
 * Options interface for advanced plugin configuration
 */
interface PluginOptions<TConfig extends object> {
    /** Unique identifier for the plugin */
    id: string;
    /** Plugin initialization function */
    init?: (plugin: PluginBase<TConfig>, deck: RevealInstance, config: TConfig) => void | Promise<void>;
    /** Default configuration object */
    defaultConfig?: TConfig;
}
/**
 * Base class for Reveal.js plugins providing standard functionality for
 * configuration management, initialization, and data sharing.
 */
export declare class PluginBase<TConfig extends object = Record<string, never>> {
    private readonly defaultConfig;
    private readonly pluginInit?;
    readonly pluginId: string;
    private mergedConfig;
    /** Public data storage for plugin state */
    data: Record<string, unknown>;
    /**
     * Create a new plugin instance
     */
    constructor(idOrOptions: string | PluginOptions<TConfig>, init?: (plugin: PluginBase<TConfig>, deck: RevealInstance, config: TConfig) => void | Promise<void>, defaultConfig?: TConfig);
    /**
     * Initialize plugin configuration by merging default and user settings
     */
    private initializeConfig;
    /**
     * Get the current plugin configuration
     */
    getCurrentConfig(): TConfig;
    /**
     * Get plugin data if any exists
     */
    getData(): Record<string, unknown> | undefined;
    /**
     * Initialize the plugin
     */
    init(deck: RevealInstance): void | Promise<void>;
    /**
     * Create the plugin interface containing all exports
     */
    createInterface(additionalExports?: Record<string, unknown>): Record<string, unknown>;
}
export {};
