export interface RevealSlideEvent {
	type: string;
	currentSlide: HTMLElement;
	previousSlide: HTMLElement;
	indexh: number;
	indexv: number;
	bubbles: boolean;
	cancelable: true;
	target: HTMLElement;
	currentTarget: null;
	defaultPrevented: boolean;
	eventPhase: number;
}

export type EnvironmentInfo = {
    /**
     * True when the plugin's own file has a URL, so a stylesheet path can be
     * derived from it rather than guessed at. False inside an application bundle
     * and on a dev server, both of which own the CSS pipeline themselves.
     */
    hasResolvableSource: boolean;
    hasWindow: boolean;
    hasDocument: boolean;

    /** @deprecated The inverse of `hasResolvableSource`, under a name that states a conclusion rather than the test. */
    isBundled: boolean;
    /** @deprecated Nothing in the toolkit reads this. Kept so 1.0.x callers still compile. */
    isDevelopment: boolean;
    /** @deprecated Nothing in the toolkit reads this. Kept so 1.0.x callers still compile. */
    hasHMR: boolean;
    /** @deprecated Nothing in the toolkit reads this. Kept so 1.0.x callers still compile. */
    isViteDev: boolean;
};