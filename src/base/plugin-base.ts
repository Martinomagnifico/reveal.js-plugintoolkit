import type { Api as RevealApi } from 'reveal.js';
import deepmerge from 'deepmerge';
import { detectEnvironment } from './environment';

export type RevealInstance = RevealApi;


// Options interface for advanced plugin configuration

interface PluginOptions<TConfig extends object> {
    /** Unique identifier for the plugin */
    id: string;
    /** Plugin initialization function */
    init?: (plugin: PluginBase<TConfig>, deck: RevealInstance, config: TConfig) => void | Promise<void>;
    /** Default configuration object */
    defaultConfig?: TConfig;
}


// Base class for Reveal.js plugins providing standard functionality for configuration management, initialization, and data sharing.

export class PluginBase<TConfig extends object = Record<string, never>> {
    private readonly defaultConfig: TConfig;
    private readonly pluginInit?: (plugin: PluginBase<TConfig>, deck: RevealInstance, config: TConfig) => void | Promise<void>;
    public readonly pluginId: string;
    private mergedConfig: TConfig | null = null;
    private userConfigData: Partial<TConfig> | null = null;

    /** Public data storage for plugin state */
    public data: Record<string, unknown> = {};


    // Create a new plugin instance

    constructor(
        idOrOptions: string | PluginOptions<TConfig>,
        init?: (plugin: PluginBase<TConfig>, deck: RevealInstance, config: TConfig) => void | Promise<void>,
        defaultConfig?: TConfig
    ) {
        if (typeof idOrOptions === 'string') {
            this.pluginId = idOrOptions;
            this.pluginInit = init;
            this.defaultConfig = defaultConfig || {} as TConfig;
        } else {
            this.pluginId = idOrOptions.id;
            this.pluginInit = idOrOptions.init;
            this.defaultConfig = idOrOptions.defaultConfig || {} as TConfig;
        }
    }


    // Initialize plugin configuration by merging default and user settings

    private initializeConfig(deck: RevealInstance): void {
        const baseConfig = this.defaultConfig;
        
        const revealConfig = deck.getConfig() as Record<string, unknown>;
        const userConfig = (revealConfig[this.pluginId] || {}) as Partial<TConfig>;
        this.userConfigData = userConfig;
        
        this.mergedConfig = deepmerge(baseConfig, userConfig, {
            arrayMerge: (_, sourceArray) => sourceArray,
            clone: true
        });
    }


    // Get the current plugin configuration

    public getCurrentConfig(): TConfig {
        if (!this.mergedConfig) {
            throw new Error('Plugin configuration has not been initialized');
        }
        return this.mergedConfig;
    }


    // Get plugin data if any exists

    public getData(): Record<string, unknown> | undefined {
        return Object.keys(this.data).length > 0 ? this.data : undefined;
    }

    public get userConfig(): Partial<TConfig> {
        return this.userConfigData || {};
    }


    // Gets information about the current JavaScript environment

    public getEnvironmentInfo = () => {
        return detectEnvironment();
    };


    // Initialize the plugin

    public init(deck: RevealInstance): void | Promise<void> {
        this.initializeConfig(deck);

        if (this.pluginInit) {
            return this.pluginInit(this, deck, this.getCurrentConfig());
        }
    }


    // Create the plugin interface containing all exports

    public createInterface(additionalExports: Record<string, unknown> = {}) {
        const exports: Record<string, unknown> = {
            id: this.pluginId,
            init: (deck: RevealInstance) => this.init(deck),
            getConfig: () => this.getCurrentConfig(),
            getData: () => this.getData(),
            ...additionalExports
        };

        return exports;
    }
}
