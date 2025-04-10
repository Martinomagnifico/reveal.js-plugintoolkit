import type { Api } from 'reveal.js';
import type { Config } from './config';
import { pluginDebug } from '../../../src';

export class DemoPlugin {
    private readonly deck: Api;
    private readonly options: Config;

    constructor(deck: Api, options: Config) {
        this.deck = deck;
        this.options = options;
        pluginDebug.log('Demo plugin initialized with options:', options);
    }

    // Example method to demonstrate functionality
    public initialize(): void {

        pluginDebug.log('Demo plugin initialized successfully');
 
        const indicator = document.createElement('div');
        indicator.className = 'demo-plugin-indicator';
        indicator.textContent = 'Demo Plugin Active';
        
        document.body.appendChild(indicator);
        pluginDebug.log('Indicator element added');
    }
    
    static create(deck: Api, options: Config): DemoPlugin {
        const instance = new DemoPlugin(deck, options);
        instance.initialize();
        return instance;
    }
}