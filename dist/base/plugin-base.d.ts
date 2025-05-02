import { Api as RevealApi } from 'reveal.js';
export type RevealInstance = RevealApi;
interface PluginOptions<TConfig extends object> {
    /** Unique identifier for the plugin */
    id: string;
    /** Plugin initialization function */
    init?: (plugin: PluginBase<TConfig>, deck: RevealInstance, config: TConfig) => void | Promise<void>;
    /** Default configuration object */
    defaultConfig?: TConfig;
}
export declare class PluginBase<TConfig extends object = Record<string, never>> {
    private readonly defaultConfig;
    private readonly pluginInit?;
    readonly pluginId: string;
    private mergedConfig;
    private userConfigData;
    /** Public data storage for plugin state */
    data: Record<string, unknown>;
    constructor(idOrOptions: string | PluginOptions<TConfig>, init?: (plugin: PluginBase<TConfig>, deck: RevealInstance, config: TConfig) => void | Promise<void>, defaultConfig?: TConfig);
    private initializeConfig;
    getCurrentConfig(): TConfig;
    getData(): Record<string, unknown> | undefined;
    get userConfig(): Partial<TConfig>;
    getEnvironmentInfo: () => {
        isDevServer: boolean;
        isWebpackHMR: boolean;
        isVite: boolean;
        isVitePreview: boolean;
        hasModuleScripts: boolean;
        isModuleBundler: boolean;
        isAMD: boolean;
        isBundlerEnvironment: boolean;
    };
    init(deck: RevealInstance): void | Promise<void>;
    createInterface(additionalExports?: Record<string, unknown>): Record<string, unknown>;
}
export {};
