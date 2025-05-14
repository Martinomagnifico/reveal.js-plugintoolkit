import { Api } from 'reveal.js';
/**
 * Sets up horizontal and vertical slide change events
 * @param deck - The reveal.js deck instance
 * @fires slidechanged-h When horizontal slide index changes
 * @fires slidechanged-v When vertical slide index changes within same horizontal stack
 */
export declare const addDirectionEvents: (deck: Api) => void;
export declare const addMoreDirectionEvents: (deck: Api) => void;
/**
 * Adds custom events for scroll mode transitions
 * @param deck - The reveal.js deck instance
 * @fires scrollmode-enter When entering scroll mode
 * @fires scrollmode-exit When exiting scroll mode
 * @returns A cleanup function to disconnect the observer
 */
export declare const addScrollModeEvents: (deck: Api) => (() => void);
