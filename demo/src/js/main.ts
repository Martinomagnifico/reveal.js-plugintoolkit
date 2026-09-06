import type { Config } from './config';
import type { RevealInstance, RevealSlideEvent } from '../../../src/types';
import { pluginDebug } from '../../../src';

// Importing the plugin tools (contains also the direction events and section tools). It is not used here because the functions below are added.
import { pluginTools } from '../../../src';

// Importing the direction events
import { eventTools } from '../../../src';

// Importing the section tools
import { sectionTools } from '../../../src';

// Importing the theme tools
import { themeTools } from '../../../src';

export class DemoPlugin {
    private readonly deck: RevealInstance;
    private readonly options: Config;
    private currentSlide: HTMLElement | null = null;

    constructor(deck: RevealInstance, options: Config) {
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

        // Using some of the functions from pluginTools:

        eventTools.addMoreDirectionEvents(this.deck);
        eventTools.addScrollModeEvents(this.deck);

        // Keeps --c-theme-color on the deck, so the indicator below follows the slide on screen.
        void themeTools.addThemeColor(this.deck).then((colors) => {
            pluginDebug.log("Theme colors:", colors);
        });

        this.deck.on("slidechanged-h", (event: unknown) => {
            const e = event as RevealSlideEvent;
            if (e.currentSlide !== this.currentSlide) {
                pluginDebug.log("Moved horizontally", e);
                const slideType = sectionTools.getSectionType(e.currentSlide);
                pluginDebug.log("Slide type:", slideType);
                this.currentSlide = e.currentSlide;
            }
        });

        this.deck.on("slidechanged-v", (event: unknown) => {
        const e = event as RevealSlideEvent;
        if (e.currentSlide !== this.currentSlide) {
            pluginDebug.log("Moved vertically", e);
            this.currentSlide = e.currentSlide;
        }
        });

        this.deck.on('scrollmode-enter', (event: unknown) => {
            const e = event as RevealSlideEvent;
            pluginDebug.log("Scroll mode enter", e);
        });    

        this.deck.on('scrollmode-exit', (event: unknown) => {
            const e = event as RevealSlideEvent;
            pluginDebug.log("Scroll mode exit", e);
        });

    }

    static create(deck: RevealInstance, options: Config): DemoPlugin {
        const instance = new DemoPlugin(deck, options);
        instance.initialize();
        return instance;
    }

}