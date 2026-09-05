import type { RevealInstance } from "../../types";
import { whenThemeApplied } from "../plugin-css/theme";

/** Marked on the deck, not kept in this module: every plugin bundles its own copy of the toolkit, and `Symbol.for` is what they share. */
const THEME_COLOR_MARK = Symbol.for("reveal.js-plugintoolkit.themeColor");

/** Reveal puts these on the Reveal element when the slide it is showing has a background lighter or darker than the theme. */
const LIGHT_CLASS = "has-light-background";
const DARK_CLASS = "has-dark-background";

/** Published on the viewport, for any plugin or any deck's own CSS to read. The viewport rather than the Reveal element, because a plugin that draws a fixed overlay puts it on the body, outside the deck, and would not inherit from there. */
const THEME_COLOR_VAR = "--c-theme-color";
const THEME_HEADING_VAR = "--c-theme-heading-color";

/** What gets measured. A theme gives headings a colour of their own — moon's is #eee8d5 against #93a1a1 body — so one reading cannot answer for both. Links are not here: no bundled theme changes a link on an inverted background, and `--r-link-color-dark` is a darker shade for the rolling-link effect rather than a colour for one. */
const MEASURED = { text: "section", heading: "h1" } as const;

/** Put beside the variable while the slide's background goes against the theme. Reveal's own two classes say whether a background is light or dark, which is not the same question: a light slide in a light deck is not inverted. */
const INVERTED_CLASS = "c-theme-inverted";

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

/** Write whichever of the two colours matches the background the deck is showing right now, and say which of the two it is. Reveal marks the deck; the answer goes on the viewport, which is an ancestor of both the deck and anything a plugin fixes to the page. */
const apply = (revealElement: HTMLElement, host: HTMLElement, colors: ThemeColors): void => {
	const inverted =
		colors.theme === "dark"
			? revealElement.classList.contains(LIGHT_CLASS)
			: revealElement.classList.contains(DARK_CLASS);

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

	apply(revealElement, host, colors);

	// An observer rather than `slidechanged`: Reveal works out the background and adds the class after the event has been dispatched, so a listener reads the classes of the slide you just left.
	const observer = new MutationObserver(() => apply(revealElement, host, colors));
	observer.observe(revealElement, { attributes: true, attributeFilter: ["class"] });

	return colors;
};

/**
 * Keep `--c-theme-color` on the Reveal element in step with the slide being shown.
 *
 * A deck can give a slide a background that goes against the theme, and Reveal marks that slide as light or dark. This publishes the text colour that belongs with it, so a plugin drawing over the slides — a bar, a set of bullets, a button — can follow the deck instead of hardcoding a colour.
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
