import type { Api } from 'reveal.js';
import type { Config } from './config';

import { PluginBase, pluginCSS } from '../../../src';

import { defaultConfig } from './config';
import { DemoPlugin } from './main';



// We are importing the CSS here. This import will not be present in the output JS files.
import '../css/demo-plugin.css';



const init = async (plugin: PluginBase<Config>, deck: Api, config: Config): Promise<void> => {
    
    // Load CSS if needed
    if (config.cssautoload) {

        try {
            await pluginCSS({
                id: plugin.pluginId,
                enableLoading: config.cssautoload,
                userPath: config.csspath,
                developerPaths: {
                    // You could also use the pluginId as a variable here
                    npm: 'node_modules/reveal.js-demo-plugin/dist/demo-plugin.css',
                    standard: 'plugin/demo-plugin/demo-plugin.css',
                    fallback: './css/demo-plugin.css'
                },
                debug: config.debug
            });
        } catch (err) {
            console.warn('CSS loading failed, but plugin will continue:', err);
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