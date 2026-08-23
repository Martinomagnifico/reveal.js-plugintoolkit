/**
 * Every Reveal theme — black, white, dracula, the rest — declares
 * `--r-main-color` on `:root`, and `reveal.css` itself does not. A non-empty
 * computed value is therefore proof that a theme's stylesheet has been parsed
 * and applied, not merely requested.
 */
const THEME_MARKER = '--r-main-color';

const themeApplied = (): boolean => {
	if (typeof document === 'undefined' || typeof window === 'undefined') return false;
	try {
		return (
			getComputedStyle(document.documentElement).getPropertyValue(THEME_MARKER).trim() !== ''
		);
	} catch {
		return false;
	}
};

/**
 * Wait until a Reveal theme is applied to the page.
 *
 * For plugins that read colours or sizes back off the page. Under a bundler or a
 * dev server the CSS is injected by JavaScript, so it can land *after* the
 * plugin initialises; anything measured before that returns the browser's
 * defaults, and a value read once at startup keeps those defaults for the rest
 * of the session.
 *
 * A deck that styles itself without a Reveal theme never sets the marker, which
 * is why this gives up rather than waiting forever. Callers that can act late
 * should keep watching with a longer timeout after a `false`, so a theme that
 * arrives eventually is still picked up.
 *
 * @param timeout - How long to wait before giving up, in ms.
 * @returns `true` if a theme was seen, `false` if the wait timed out.
 */
export const whenThemeApplied = (timeout = 1000): Promise<boolean> => {
	if (themeApplied()) return Promise.resolve(true);

	return new Promise((resolve) => {
		const deadline = Date.now() + timeout;

		const check = (): void => {
			if (themeApplied()) {
				resolve(true);
				return;
			}

			if (Date.now() >= deadline) {
				resolve(false);
				return;
			}

			// setTimeout rather than requestAnimationFrame: a deck opened in a
			// background tab is given no frames, and would sit out the whole
			// timeout for no reason.
			setTimeout(check, 16);
		};

		check();
	});
};

/**
 * Whether a Reveal theme is applied right now, without waiting.
 */
export const isThemeApplied = (): boolean => themeApplied();
