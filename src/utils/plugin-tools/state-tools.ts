import type { RevealInstance, RevealSlideEvent } from "../../types";

/** Marked on the deck, not kept in this module: every plugin bundles its own copy of the toolkit, and `Symbol.for` is what they share. */
const SLIDE_STATES_MARK = Symbol.for("reveal.js-plugintoolkit.slideStates");

/** On the viewport while the deck is in scroll view. */
const SCROLL_CLASS = "reveal-scroll";

/**
 * A stack's own `data-state`, copied onto each of its vertical slides.
 *
 * Reveal applies a stack's state together with the state of the vertical slide being shown. Scroll view takes the vertical slides out of their stack, and depending on how it was reached, leaves the stack behind empty or removes it, so by then the slide can no longer tell which state its stack had. Written on the slide itself, the state goes wherever the slide goes: into its scroll page, and back out again, because Reveal restores the slides from a copy of the HTML it takes before building the pages, and the copy has the attribute in it.
 */
const STACK_STATE_ATTRIBUTE = "data-toolkit-stack-state";

interface SlideStateRecord {
	revealElement: HTMLElement;
	/** The viewport the states go on: the body for a deck that has the page to itself, the deck itself when embedded. */
	host: HTMLElement;
	/** Whether the deck was in scroll view the last time this looked. */
	inScrollView: boolean;
	/** The states this put on the viewport, and so has to take off again. Empty in the regular view, where they are Reveal's. */
	applied: string[];
	/** The states Reveal applied for the slide last on screen in the regular view, taken over when scroll view starts. */
	regularStates: string[];
	/** True while scroll view is switching on, when it reports slide changes of its own. */
	switching: boolean;
	/** Whether the stacks were read before scroll view took them apart. */
	stacksRead: boolean;
	warned: boolean;
}

type MarkedDeck = RevealInstance & {
	[SLIDE_STATES_MARK]?: SlideStateRecord;
};

/** Non-enumerable, so the mark stays out of anything that walks the deck. */
const mark = (deck: RevealInstance, key: symbol, value: unknown): void => {
	Object.defineProperty(deck, key, { value, configurable: true, enumerable: false, writable: false });
};

/** Reveal splits a state on spaces, so `data-state="dim no-menu"` is two classes. */
const splitStates = (value: string | null | undefined): string[] =>
	(value ?? "").split(" ").filter(Boolean);

const unique = (states: string[]): string[] => Array.from(new Set(states));

const isInScrollView = (host: HTMLElement): boolean => host.classList.contains(SCROLL_CLASS);

/**
 * Copy each stack's state onto its vertical slides, or take a stale copy off.
 *
 * Only possible while the stacks are still stacks, so not in scroll view. Returns whether it could.
 */
const stampStackStates = (revealElement: HTMLElement): boolean => {
	if (revealElement.querySelector(".scroll-page")) return false;

	for (const stack of Array.from(revealElement.querySelectorAll<HTMLElement>(".slides > section"))) {
		const verticals = stack.querySelectorAll<HTMLElement>(":scope > section");
		if (!verticals.length) continue;

		const stackState = stack.getAttribute("data-state");
		for (const vertical of Array.from(verticals)) {
			if (stackState) vertical.setAttribute(STACK_STATE_ATTRIBUTE, stackState);
			else vertical.removeAttribute(STACK_STATE_ATTRIBUTE);
		}
	}
	return true;
};

/**
 * The states that belong with a slide, in the order Reveal applies them: the stack's first, then the slide's own.
 *
 * In the regular view a vertical slide's stack is its parent. In scroll view it is not, and the copy made by `stampStackStates` stands in for it.
 */
const statesOf = (slide: HTMLElement | null | undefined): string[] => {
	if (!slide) return [];

	const parent = slide.parentElement;
	const stackStates =
		parent?.tagName === "SECTION"
			? splitStates(parent.getAttribute("data-state"))
			: splitStates(slide.getAttribute(STACK_STATE_ATTRIBUTE));

	return unique([...stackStates, ...splitStates(slide.getAttribute("data-state"))]);
};

/**
 * Make the viewport carry the states of the slide on screen, taking off only the ones this put there itself.
 *
 * With `dispatch`, a state that was not on the previous slide also fires an event named after it, as Reveal does in the regular view.
 */
const sync = (
	deck: RevealInstance,
	record: SlideStateRecord,
	slide: HTMLElement | null | undefined,
	{ dispatch }: { dispatch: boolean }
): void => {
	const target = statesOf(slide);

	for (const state of record.applied) {
		if (!target.includes(state)) record.host.classList.remove(state);
	}
	for (const state of target) {
		record.host.classList.add(state);
		if (dispatch && !record.applied.includes(state)) {
			deck.dispatchEvent({ type: state });
		}
	}

	record.applied = target;
};

const warnAboutStacks = (record: SlideStateRecord): void => {
	if (record.warned || record.stacksRead) return;

	// Only a deck with stacks is missing anything. In scroll view a stack shows as slides with a vertical index above 0.
	const hasStacks = record.revealElement.querySelector(
		'.scroll-page section[data-index-v]:not([data-index-v="0"])'
	);
	if (!hasStacks) return;

	record.warned = true;
	console.warn(
		"[plugintoolkit]: addSlideStates was called after the deck had already switched to scroll view, so the states of stacks are unknown until it leaves scroll view once. Slides still get their own states. Call it from a plugin's init to avoid this."
	);
};

const install = (deck: RevealInstance): SlideStateRecord | null => {
	const revealElement = deck.getRevealElement();
	if (!revealElement) return null;

	const host = deck.getViewportElement() ?? revealElement;
	const inScrollView = isInScrollView(host);
	const record: SlideStateRecord = {
		revealElement,
		host,
		inScrollView,
		applied: [],
		regularStates: inScrollView ? [] : statesOf(deck.getCurrentSlide()),
		switching: false,
		stacksRead: stampStackStates(revealElement),
		warned: false,
	};

	// Scroll view starts with no states at all, so the slide on screen gets its own right away.
	if (inScrollView) {
		warnAboutStacks(record);
		sync(deck, record, deck.getCurrentSlide(), { dispatch: false });
	}

	/**
	 * Hand the states over when the deck switches between the two views.
	 *
	 * Called from the observer and from `slidechanged` both, because whichever comes first has to do it: while scroll view switches on, Reveal activates pages and reports slide changes before the class change reaches the observer, and while it switches off, Reveal applies the states and reports the slide the same way.
	 */
	const noticeSwitch = (): void => {
		const nowInScrollView = isInScrollView(host);
		if (nowInScrollView === record.inScrollView) return;
		record.inScrollView = nowInScrollView;

		if (nowInScrollView) {
			warnAboutStacks(record);
			// Reveal's states for the slide that was on screen are still on the viewport. Taken over, so that they come off again when the reader moves on.
			record.applied = unique([...record.applied, ...record.regularStates]);
			// While scroll view builds its pages it passes through slides the reader never went to, so nothing fires until it is done.
			record.switching = true;
			queueMicrotask(() => {
				record.switching = false;
			});
			sync(deck, record, deck.getCurrentSlide(), { dispatch: false });
		} else {
			// Reveal is back in charge, and has worked out the states for this slide itself. The viewport is set to match what it expects, and nothing is owned any more.
			sync(deck, record, deck.getCurrentSlide(), { dispatch: false });
			record.applied = [];
			record.regularStates = statesOf(deck.getCurrentSlide());
			record.stacksRead = stampStackStates(revealElement) || record.stacksRead;
		}
	};

	// Scroll view switches on and off with the size of the deck, and Reveal says so only through the class. Class changes from this helper itself are states, not the scroll-view class, so they fall through.
	const observer = new MutationObserver(noticeSwitch);
	observer.observe(host, { attributes: true, attributeFilter: ["class"] });

	// Slides a plugin or Reveal added or removed while starting up are all in place by now.
	deck.on("ready", () => {
		noticeSwitch();
		if (record.inScrollView) {
			sync(deck, record, deck.getCurrentSlide(), { dispatch: false });
		} else {
			record.regularStates = statesOf(deck.getCurrentSlide());
			record.stacksRead = stampStackStates(revealElement) || record.stacksRead;
		}
	});

	deck.on("slidechanged", (event) => {
		noticeSwitch();
		const { currentSlide } = event as unknown as RevealSlideEvent;
		const slide = currentSlide ?? deck.getCurrentSlide();

		if (record.inScrollView) {
			sync(deck, record, slide, { dispatch: !record.switching });
		} else {
			// Reveal's to apply; noted, for the moment scroll view takes over.
			record.regularStates = statesOf(slide);
		}
	});

	return record;
};

/**
 * Make `data-state` work in scroll view the way it does in the regular view.
 *
 * In the regular view Reveal puts a slide's `data-state` on the viewport as classes, together with the state of the stack a vertical slide sits in, and fires an event named after each. Scroll view does neither: the slide on screen can have a state, and nothing on the page gets the class. That leaves a plugin, or a deck's own CSS, with no way to hide or show something per slide once the deck is scrolled. This fills that in for scroll view, and leaves the regular view to Reveal.
 *
 * - The classes go on the viewport, as Reveal's do: the body for a deck that has the page to itself, the deck itself when embedded, so two decks on one page keep their states apart.
 * - A state that was not on the previous slide fires an event named after it, as in the regular view. It fires after `slidechanged` rather than before, because scroll view only reports the new slide through that event.
 * - Stack states are read while the stacks are still intact, so call it from a plugin's `init`. Called after the deck has already switched to scroll view, slides get their own states, and stacks catch up after the first switch back.
 *
 * Any plugin may call it. The first call on a deck installs; later calls do nothing.
 *
 * ```css
 * .hide-my-thing .my-plugin-thing { visibility: hidden; }
 * ```
 *
 * @param deck - The reveal.js deck instance.
 */
export const addSlideStates = (deck: RevealInstance): void => {
	const marked = deck as MarkedDeck;
	if (marked[SLIDE_STATES_MARK]) return;

	const record = install(deck);
	if (record) mark(deck, SLIDE_STATES_MARK, record);
};
