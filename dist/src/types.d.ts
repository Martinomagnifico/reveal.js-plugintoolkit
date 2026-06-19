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
    isDevelopment: boolean;
    hasHMR: boolean;
    isViteDev: boolean;
    hasWindow: boolean;
    hasDocument: boolean;
};
