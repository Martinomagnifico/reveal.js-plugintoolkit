import type { Api } from 'reveal.js';
import type { RevealSlideEvent } from "../../types";

/**
 * Sets up horizontal and vertical slide change events
 * @param deck - The reveal.js deck instance
 * @fires slidechanged-h When horizontal slide index changes
 * @fires slidechanged-v When vertical slide index changes within same horizontal stack
 */
export const addMoreDirectionEvents = (deck: Api): void => {
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