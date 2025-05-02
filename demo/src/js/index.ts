import type { Api } from 'reveal.js';
import type { Config } from './config';

// From npm the next line would be: ... from 'reveal.js-plugintoolkit'
import { PluginBase, pluginCSS } from '../../../src';
import { pluginDebug } from '../../../src';

import { defaultConfig } from './config';
import { DemoPlugin } from './main';

// We are importing the CSS here. This import will not be present in the output JS files.
import '../css/demo-plugin.css';

const init = async (plugin: PluginBase<Config>, deck: Api, config: Config): Promise<void> => {
    
    // Enable debug mode if needed
    pluginDebug.initialize(config.debug, 'demo-plugin');

    // Just give some info about the environment
    const env = plugin.getEnvironmentInfo();
    pluginDebug.log('Environment:', env);

    // Load CSS if needed
    if (config.cssautoload) {

        try {
            await pluginCSS({
                id: plugin.pluginId,
                cssautoload: config.cssautoload,
                csspath: config.csspath,
                debug: config.debug
            });
        } catch (err) {
            pluginDebug.warn('CSS loading failed, but plugin will continue:', err);
        }
    }
    
    // Initialize the plugin and wait for it to complete
    // This will block Reveal.js initialization until DemoPlugin is fully ready
    await DemoPlugin.create(deck, config);
    
    // Now we can return, and Reveal will continue initialization
}

export default () => {
    const plugin = new PluginBase('demo-plugin', init, defaultConfig);
    return plugin.createInterface();
};