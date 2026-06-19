import { PluginCssOptions } from './types';
import { PluginBase } from '../../base/plugin-base';
export declare function pluginCSS<TConfig extends object>(firstParam: PluginBase<TConfig> | PluginCssOptions, config?: {
    cssautoload?: boolean;
    csspath?: string | false;
    debug?: boolean;
}): Promise<void>;
