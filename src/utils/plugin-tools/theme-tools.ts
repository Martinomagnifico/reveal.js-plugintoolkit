import type { RevealInstance } from "../../types";
import { whenThemeApplied } from "../plugin-css/theme";

/** Marked on the deck, not kept in this module: every plugin bundles its own copy of the toolkit, and `Symbol.for` is what they share. */
const THEME_COLOR_MARK = Symbol.for("reveal.js-plugintoolkit.themeColor");

/** Reveal puts these on the Reveal element when the slide it is showing has a background lighter or darker than the theme. */
const LIGHT_CLASS = "has-light-background";
const DARK_CLASS = "has-dark-background";

/** Published on the viewport, for any plugin or any deck's own CSS to read. The viewport rather than the Reveal element, because a plugin that fixes an overlay to the page puts it on the body, outside the deck, and would not inherit from there. */
const THEME_COLOR_VAR = "--c-theme-color";
const THEME_HEADING_VAR = "--c-theme-heading-color";

/** What gets measured. A theme gives headings a colour of their own — moon's is #eee8d5 against #93a1a1 body — so one reading cannot answer for both. Links are not here: no bundled theme changes a link on an inverted background, and `--r-link-color-dark` is a darker shade for the rolling-link effect rather than a colour for one. */
const MEASURED = { text: "section", heading: "h1" } as const;

/** Put beside the variable while the slide's background contrasts the theme. Reveal's own two classes say whether a background is light or dark, which is not the same question: a light slide in a light deck is not inverted. */
const INVERTED_CLASS = "c-theme-inverted";

/** On the viewport while the deck is in scroll view, which is where Reveal puts the background class in that view. */
const SCROLL_CLASS = "reveal-scroll";

/** Reveal's class for a section that holds vertical slides. */
const STACK_CLASS = "stack";

/** One element's colour, on an ordinary slide and on an inverted one. */
export interface ThemeColorPair {
	/** The colour on an ordinary slide. */
	regular: string;
	/** The colour on a slide whose background goes the other way. */
	inverse: string;
}

/** What a Reveal theme paints with, and which way round the theme itself is. */
export interface ThemeColors {
	/** `dark` for a theme with light text, `light` for one with dark text. */
	theme: "light" | "dark";
	/** Body text. */
	text: ThemeColorPair;
	/** Headings, which most themes colour differently from body text. */
	heading: ThemeColorPair;
}

export interface ThemeColorOptions {
	/** How long to wait for a theme before giving up, in ms. */
	timeout?: number;
}

type MarkedDeck = RevealInstance & {
	[THEME_COLOR_MARK]?: Promise<ThemeColors | null>;
};

/** Non-enumerable, so the mark stays out of anything that walks the deck. */
const mark = (deck: RevealInstance, key: symbol, value: unknown): void => {
	Object.defineProperty(deck, key, {
		value,
		configurable: true,
		enumerable: false,
		writable: false,
	});
};

/**
 * Ask the theme what it paints with, by putting one section in the deck, reading it, and reading it again with Reveal's inverted-background class on it. One section and one pass, however many elements are read from it.
 */
const measure = (revealElement: HTMLElement): ThemeColors | null => {
	const slides = revealElement.getElementsByClassName("slides")[0];
	if (!slides) return null;

	const section = document.createElement("section");
	const heading = document.createElement(MEASURED.heading);
	section.appendChild(heading);
	slides.appendChild(section);

	const read = (): { text: string; heading: string } => ({
		text: getComputedStyle(section).getPropertyValue("color"),
		heading: getComputedStyle(heading).getPropertyValue("color"),
	});

	const regular = read();
	section.classList.add(LIGHT_CLASS);
	let inverse = read();
	let theme: ThemeColors["theme"] = "dark";

	// A theme that is already light does not change on a light background, so ask it the other way round instead.
	if (inverse.text === regular.text && inverse.heading === regular.heading) {
		theme = "light";
		section.classList.remove(LIGHT_CLASS);
		section.classList.add(DARK_CLASS);
		inverse = read();
	}

	section.remove();
	return {
		theme,
		text: { regular: regular.text, inverse: inverse.text },
		heading: { regular: regular.heading, inverse: inverse.heading },
	};
};

const has = (element: HTMLElement | null, className: string): boolean =>
	element?.classList.contains(className) ?? false;

/**
 * Whether the slide on screen has a light or a dark background, or `null` if it has neither and the theme's own background is showing.
 *
 * Three places have to be asked, because Reveal reports the three cases differently. In ordinary view it copies the class onto the Reveal element, in scroll view onto the viewport, and for a slide that takes its background from the stack around it, onto neither.
 */
const backgroundContrast = (
	deck: RevealInstance,
	revealElement: HTMLElement,
	viewport: HTMLElement | null
): "light" | "dark" | null => {
	const host = has(viewport, SCROLL_CLASS) ? viewport : revealElement;
	if (has(host, LIGHT_CLASS)) return "light";
	if (has(host, DARK_CLASS)) return "dark";

	// A vertical slide takes the background of the stack it sits in, and Reveal marks the stack itself rather than the deck, so neither element above mentions it.
	const parent = deck.getCurrentSlide?.()?.parentElement ?? null;
	if (parent && has(parent, STACK_CLASS)) {
		if (has(parent, LIGHT_CLASS)) return "light";
		if (has(parent, DARK_CLASS)) return "dark";
	}

	return null;
};

/** Whether the background now on screen contrasts the theme. A light slide in a light deck is not inverted, so the theme's own direction decides which of Reveal's two classes counts. */
const isInverted = (
	deck: RevealInstance,
	revealElement: HTMLElement,
	colors: ThemeColors
): boolean => {
	const contrast = backgroundContrast(deck, revealElement, deck.getViewportElement());
	return colors.theme === "dark" ? contrast === "light" : contrast === "dark";
};

/** Write whichever of the two colours matches, and mark the case. The answer goes on the viewport, which is an ancestor of both the deck and anything a plugin fixes to the page. */
const write = (host: HTMLElement, colors: ThemeColors, inverted: boolean): void => {
	const pick = (pair: ThemeColorPair): string => (inverted ? pair.inverse : pair.regular);

	host.style.setProperty(THEME_COLOR_VAR, pick(colors.text));
	host.style.setProperty(THEME_HEADING_VAR, pick(colors.heading));
	host.classList.toggle(INVERTED_CLASS, inverted);
};

const install = async (
	deck: RevealInstance,
	{ timeout = 1000 }: ThemeColorOptions
): Promise<ThemeColors | null> => {
	const revealElement = deck.getRevealElement();
	if (!revealElement) return null;

	// The viewport is the body on an ordinary deck and the wrapper on an embedded one, so it is an ancestor either way. A deck old enough not to have one falls back to itself.
	const host = deck.getViewportElement() ?? revealElement;

	// Reading before the theme's stylesheet has been applied returns the browser's initial black, and that black would then be published for the rest of the session.
	await whenThemeApplied(timeout);

	const colors = measure(revealElement);
	if (!colors) return null;

	let applied = isInverted(deck, revealElement, colors);
	write(host, colors, applied);

	// Marking the host is itself a class change, and the host is one of the elements being watched, so a run that would change nothing stops here instead of writing the same values again.
	const update = (): void => {
		const inverted = isInverted(deck, revealElement, colors);
		if (inverted === applied) return;
		applied = inverted;
		write(host, colors, inverted);
	};

	// An observer rather than only `slidechanged`: Reveal works out the background and adds the class after the event has been dispatched, so a listener on its own reads the classes of the slide you just left.
	const observer = new MutationObserver(update);
	observer.observe(revealElement, { attributes: true, attributeFilter: ["class"] });

	// In scroll view the class goes on the viewport instead, and the viewport also gains and loses the scroll-view class itself when the deck changes size.
	if (host !== revealElement) {
		observer.observe(host, { attributes: true, attributeFilter: ["class"] });
	}

	// A move between two stacks changes which background is shown without changing any class on the deck, so nothing above would report it.
	deck.on("slidechanged", update);

	return colors;
};

/**
 * Keep `--c-theme-color` and `--c-theme-heading-color` on the viewport matched to the slide being shown.
 *
 * A deck can give a slide a background that contrasts the theme. This publishes the text and heading colours that belong with it, so a plugin that puts a bar, a set of bullets or a button over the slides can follow the deck instead of hardcoding a colour.
 *
 * All three of the ways a slide can come by such a background are covered: its own, one it takes from the stack around it, and either of those in scroll view.
 *
 * Any plugin may call it. The first call on a deck measures the theme and installs the observer; later calls get the same colours back without measuring again, however many plugins ask and whichever of them loads first.
 *
 * ```css
 * .my-plugin-thing { color: var(--c-theme-color, currentColor); }
 * .my-plugin-accent { color: var(--c-theme-heading-color, currentColor); }
 * .c-theme-inverted .my-plugin-thing { color: var(--my-plugin-color-inverted, var(--c-theme-color, currentColor)); }
 * ```
 *
 * The class is there so a deck can style the inverted case without having to know whether its own theme is the light one or the dark one.
 *
 * @param deck - The reveal.js deck instance.
 * @returns The theme's colours, or `null` if the deck has no theme or no slides.
 */
export const addThemeColor = (
	deck: RevealInstance,
	options: ThemeColorOptions = {}
): Promise<ThemeColors | null> => {
	const marked = deck as MarkedDeck;
	const already = marked[THEME_COLOR_MARK];
	if (already) return already;

	// Marked with the promise rather than the result, and marked in the same tick as the call, so two plugins starting together share one measurement instead of both waiting and both measuring.
	const pending = install(deck, options);
	mark(deck, THEME_COLOR_MARK, pending);
	return pending;
};
