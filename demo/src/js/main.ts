import type { Api } from 'reveal.js';
import type { Config } from './config';

export class DemoPlugin {
    private readonly deck: Api;
    private readonly options: Config;
    
    constructor(deck: Api, options: Config) {
        this.deck = deck;
        this.options = options;

        if (this.options.debug) {
            console.log('Demo plugin initialized with options:', options);
        }
  
    }

    // Example method to demonstrate functionality
    public initialize(): void {
        if (this.options.debug) {
            console.log('Demo plugin initialized successfully');
        }
        const indicator = document.createElement('div');
        indicator.className = 'demo-plugin-indicator';
        indicator.textContent = 'Demo Plugin Active';
        
        document.body.appendChild(indicator);

        if (this.options.debug) {
            console.log('Indicator element added');
        }
    }
    
    static create(deck: Api, options: Config): DemoPlugin {
        const instance = new DemoPlugin(deck, options);
        instance.initialize();
        return instance;
    }
}