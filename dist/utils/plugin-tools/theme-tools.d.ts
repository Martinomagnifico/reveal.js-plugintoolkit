import { RevealInstance } from '../../types';
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
export declare const addThemeColor: (deck: RevealInstance, options?: ThemeColorOptions) => Promise<ThemeColors | null>;
