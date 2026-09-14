import type { RevealInstance } from "../../types";

export type AnchorEdge = "top" | "bottom";

export interface AnchorOptions {
	/** The edge of what the reader sees that the anchor holds. Default `top`. */
	edge?: AnchorEdge;
	/** Default `2`: above the slides, below Reveal's own controls and overlays. */
	zIndex?: number | string;
	/** Classes for the anchor, so the plugin's stylesheet can reach it and what it holds. */
	className?: string;
	/** `hide` (the default) takes the anchor out of Reveal's print view, `keep` leaves it in. */
	print?: "hide" | "keep";
}

/** On every anchor, with its edge as the value, so a deck's CSS or a test can find them. */
const ANCHOR_ATTRIBUTE = "data-toolkit-anchor";

/** On every anchor: the height of what the reader sees, in pixels, for an element that has to fill it, like a side menu. */
const HEIGHT_PROPERTY = "--toolkit-anchor-height";

/** `rtl` is `1`, not `true`, when it comes from the query string (`?rtl=1`): Reveal merges query options in as numbers. */
type AnchorConfig = { embedded?: unknown; rtl?: unknown; view?: unknown };

const configOf = (deck: RevealInstance): AnchorConfig => deck.getConfig() as AnchorConfig;

/**
 * Whether Reveal is in print view. Reveal 5 and 6 turn `?print-pdf` into `view: 'print'` before any plugin starts; Reveal 4 only reads the query string; and once the view is built, the class on the page says so in all of them.
 */
const isPrintView = (deck: RevealInstance): boolean =>
	configOf(deck).view === "print" ||
	/print-pdf/i.test(window.location.search) ||
	document.documentElement.classList.contains("print-pdf");

/**
 * Write the anchor's styles for how the deck is set up right now.
 *
 * Everything goes on the element itself, so nothing is shared: no stylesheet, no class that another copy of the toolkit, of another version, could style differently. Setting `element.style` from a script is not blocked by a Content Security Policy that blocks inline styles in markup.
 */
const styleAnchor = (
	deck: RevealInstance,
	anchor: HTMLElement,
	embedded: boolean,
	edge: AnchorEdge,
	options: AnchorOptions
): void => {
	const { style } = anchor;
	const top = edge === "top";

	style.setProperty("display", options.print !== "keep" && isPrintView(deck) ? "none" : "block");
	style.setProperty("height", "0");
	style.setProperty("margin", "0");
	style.setProperty("padding", "0");
	style.setProperty("z-index", String(options.zIndex ?? 2));

	if (embedded) {
		// The deck is the box the reader sees, and in scroll view the box that scrolls. Sticky holds on to that box, where fixed would hold on to the window. Locked at both edges, a zero-height sticky element has exactly one place to be, wherever in the deck it was inserted.
		style.setProperty("position", "sticky");
		style.setProperty("inset-inline", "auto");
		style.setProperty("top", top ? "0" : "100%");
		style.setProperty("bottom", top ? "100%" : "0");
	} else {
		// The page is the box the reader sees.
		style.setProperty("position", "fixed");
		style.setProperty("inset-inline", "0");
		style.setProperty("top", top ? "0" : "auto");
		style.setProperty("bottom", top ? "auto" : "0");
	}

	// Reveal's `rtl` option sets the direction on the slides only. Set on the anchor too, start and end inside it follow the slides. Without the option, the page's own direction is inherited. Truthy, as Reveal itself reads it.
	if (configOf(deck).rtl) style.setProperty("direction", "rtl");
	else style.removeProperty("direction");
};

/**
 * Add an anchor for an element that sits over the slides and has to stay on screen: a menubar, a button, a logo.
 *
 * The anchor is a zero-height element, a direct child of the deck, that holds one edge of what the reader sees, in every view:
 *
 * - A deck that has the page to itself: fixed to the window.
 * - An embedded deck: sticky inside the deck, so it stays at the deck's edge when the page scrolls and when the deck scrolls in scroll view.
 * - Right to left: follows Reveal's `rtl` option, and also when `configure()` changes it later. Without it, the page's own `dir`.
 * - Print view: hidden, unless `print: 'keep'`.
 *
 * Its order among the deck's children does not matter, nor how many anchors other plugins add. The styles are written on the anchor itself, so they cannot clash with another plugin's copy of the toolkit. A stylesheet can still override one of them with `!important`.
 *
 * The anchor has no height, so `height: 100%` inside it is nothing. `--toolkit-anchor-height` on the anchor is the height of what the reader sees, kept up to date, for an element that fills it from edge to edge: a side menu, a backdrop.
 *
 * Put the plugin's element inside and place it against the anchor's edge in the plugin's own CSS:
 *
 * ```css
 * .my-plugin-anchor > .my-plugin-button {
 *     position: absolute;
 *     top: 20px;                  // bottom: 20px for a bottom anchor
 *     inset-inline-end: 20px;     // or inset-inline: 0 for a bar across
 * }
 * ```
 *
 * Call it from a plugin's `init` or later. Every call adds a new anchor, so a plugin keeps the one it gets.
 *
 * @param deck - The reveal.js deck instance.
 * @param options - The edge, z-index, classes and print behaviour.
 * @returns The anchor, already in the deck, or `null` if the deck has no element.
 */
export const addAnchor = (deck: RevealInstance, options: AnchorOptions = {}): HTMLElement | null => {
	const revealElement = deck.getRevealElement();
	if (!revealElement) return null;

	const edge: AnchorEdge = options.edge === "bottom" ? "bottom" : "top";
	// Decided once: Reveal picks the viewport when the deck is created, and does not move it.
	const viewport = deck.getViewportElement() ?? document.body;
	const embedded = viewport === revealElement;

	const anchor = document.createElement("div");
	anchor.setAttribute(ANCHOR_ATTRIBUTE, edge);
	if (options.className) anchor.className = options.className;

	const restyle = () => styleAnchor(deck, anchor, embedded, edge, options);
	restyle();
	revealElement.appendChild(anchor);

	// `configure()` toggles Reveal's classes on the deck after it updates the config, so a class change is the moment to look again. Reveal changes classes on the deck often; restyling is a handful of property writes.
	new MutationObserver(restyle).observe(revealElement, {
		attributes: true,
		attributeFilter: ["class"],
	});
	// Print view is built after the plugins start.
	deck.on("ready", restyle);

	// The viewport is what the reader sees: the body, as tall as the window, or the embedded deck, also when it goes fullscreen. Inside its border, which is the box a sticky anchor holds on to.
	const measure = () => anchor.style.setProperty(HEIGHT_PROPERTY, `${viewport.clientHeight}px`);
	measure();
	new ResizeObserver(measure).observe(viewport);

	return anchor;
};
