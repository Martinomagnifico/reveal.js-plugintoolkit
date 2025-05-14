import type { Api } from 'reveal.js';
import type { RevealSlideEvent } from "../../types";

/**
 * Sets up horizontal and vertical slide change events
 * @param deck - The reveal.js deck instance
 * @fires slidechanged-h When horizontal slide index changes
 * @fires slidechanged-v When vertical slide index changes within same horizontal stack
 */
export const addDirectionEvents = (deck: Api): void => {
    let [prevH, prevV] = [0, 0];
    deck.on("slidechanged", (event: unknown) => {
        const { indexh, indexv, previousSlide, currentSlide } = event as RevealSlideEvent;
        if (indexh !== prevH) {
            deck.dispatchEvent({
                type: "slidechanged-h",
                data: { previousSlide, currentSlide, indexh, indexv },
            });
        }
        if (indexv !== prevV && indexh === prevH) {
            deck.dispatchEvent({
                type: "slidechanged-v",
                data: { previousSlide, currentSlide, indexh, indexv },
            });
        }
        [prevH, prevV] = [indexh, indexv];
    });
};

// Alias the old name
export const addMoreDirectionEvents = addDirectionEvents;


/**
 * Adds custom events for scroll mode transitions
 * @param deck - The reveal.js deck instance
 * @fires scrollmode-enter When entering scroll mode
 * @fires scrollmode-exit When exiting scroll mode
 * @returns A cleanup function to disconnect the observer
 */
export const addScrollModeEvents = (deck: Api): (() => void) => {

    const viewportElement = deck.getViewportElement();
    
    if (!viewportElement) {
        console.warn('[verticator]: Could not find viewport element');
        return () => {}; 
    }
    
    // Check if currently in scroll mode
    const isInScrollMode = () => viewportElement.classList.contains('reveal-scroll');
    
    // Track current state
    let currentScrollMode = isInScrollMode();
    
    // Flag
    let isObserverActive = true;

    const observer = new MutationObserver(() => {
        // Skip if observer should no longer be active
        if (!isObserverActive) return;
        
        const newScrollMode = isInScrollMode();
        
        // Only dispatch events when the actual scroll mode state changes
        if (newScrollMode !== currentScrollMode) {
            // Get current slide and indices to match other events
            const currentSlide = deck.getCurrentSlide();
            const indices = deck.getIndices();
            const indexh = indices.h;
            const indexv = indices.v;
            
            // Create event with matching structure to slidechanged-h/v
            const eventType = newScrollMode ? "scrollmode-enter" : "scrollmode-exit";
            
            deck.dispatchEvent({
                type: eventType,
                data: { 
                    currentSlide,
                    previousSlide: null,
                    indexh,
                    indexv
                    // We can add stuff here if needed. Plugin-authors, just ask!
                },
            });

            currentScrollMode = newScrollMode;
        }
    });

    observer.observe(viewportElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
        isObserverActive = false;
        observer.disconnect();
    };
};