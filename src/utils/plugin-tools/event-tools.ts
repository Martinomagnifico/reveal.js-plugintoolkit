import type { RevealInstance, RevealSlideEvent } from "../../types";
export type { RevealInstance };

/** Marked on the deck, not kept in this module: every plugin bundles its own copy of the toolkit, and `Symbol.for` is what they share. */
const DIRECTION_MARK = Symbol.for('reveal.js-plugintoolkit.directionEvents');
const SCROLLMODE_MARK = Symbol.for('reveal.js-plugintoolkit.scrollModeEvents');

/** A deck, plus whichever marks the toolkit has put on it. */
type MarkedDeck = RevealInstance & {
	[DIRECTION_MARK]?: true;
	[SCROLLMODE_MARK]?: () => void;
};

/** Non-enumerable, so the mark stays out of anything that walks the deck. */
const mark = (deck: RevealInstance, key: symbol, value: unknown): void => {
	Object.defineProperty(deck, key, { value, configurable: true, enumerable: false, writable: false });
};

/**
 * Sets up horizontal and vertical slide change events. Any plugin may call it; the first call on a deck installs, later calls do nothing.
 * No teardown by design: nothing stops wanting these, and `Reveal.destroy()` leaves the listener in place anyway.
 * @param deck - The reveal.js deck instance
 * @fires slidechanged-h When horizontal slide index changes
 * @fires slidechanged-v When vertical slide index changes within same horizontal stack
 */
export const addDirectionEvents = (deck: RevealInstance): void => {
	if ((deck as MarkedDeck)[DIRECTION_MARK]) return;

	let [prevH, prevV] = [0, 0];

	const onSlideChanged = (event: unknown): void => {
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
	};

	deck.on("slidechanged", onSlideChanged);
	mark(deck, DIRECTION_MARK, true);
};

// Alias the old name
export const addMoreDirectionEvents = addDirectionEvents;


/**
 * Adds custom events for scroll mode transitions. Any plugin may call it; the first call on a deck installs the observer, later calls do nothing.
 * Only the installing call gets a working teardown, so one plugin shutting down leaves the events up for the rest.
 * @param deck - The reveal.js deck instance
 * @returns A function that disconnects the observer, or a no-op if this call did not install it.
 * @fires scrollmode-enter When entering scroll mode
 * @fires scrollmode-exit When exiting scroll mode
 */
export const addScrollModeEvents = (deck: RevealInstance): (() => void) => {
	if ((deck as MarkedDeck)[SCROLLMODE_MARK]) return () => {};

	const viewportElement = deck.getViewportElement();

	// Left unmarked: nothing was installed, so a later call is free to try again.
	if (!viewportElement) {
		console.warn('[plugintoolkit]: Could not find viewport element');
		return () => {};
	}

	const isInScrollMode = () => viewportElement.classList.contains('reveal-scroll');

	let currentScrollMode = isInScrollMode();

	const observer = new MutationObserver(() => {
		const newScrollMode = isInScrollMode();

		// The class attribute is written for other reasons too, so only a real change counts.
		if (newScrollMode !== currentScrollMode) {
			// Indices and slide to match the shape of slidechanged-h/v.
			const currentSlide = deck.getCurrentSlide();
			const { h: indexh, v: indexv } = deck.getIndices();

			deck.dispatchEvent({
				type: newScrollMode ? "scrollmode-enter" : "scrollmode-exit",
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

	const teardown = (): void => {
		observer.disconnect();
		delete (deck as MarkedDeck)[SCROLLMODE_MARK];
	};

	mark(deck, SCROLLMODE_MARK, teardown);
	return teardown;
};
