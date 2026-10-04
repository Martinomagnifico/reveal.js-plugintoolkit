/**
 * A container that animates in says how far it is, and whatever is inside it waits for that. The plugin that animates the container knows its timing, so it decides when the container is far enough in; a plugin inside it, such as a chart, only has to wait for the signal, and does not need to know what animates the container.
 *
 * The signal is written on the container as `data-entrance`, and each step is also sent as an event that bubbles:
 *
 * | `data-entrance` | Event            | When                                                       |
 * | --------------- | ---------------- | ---------------------------------------------------------- |
 * | `pending`       |                  | It will animate in, and has not started                    |
 * | `shown`         | `entranceshown`  | Far enough in: half way, or at its `data-entrance-at` (0–1) |
 * | `in`            | `entrancein`     | Fully in                                                   |
 *
 * Everything lives in the page, not in this module, because every plugin bundles its own copy of the toolkit: the one that announces and the one that waits are seldom the same copy.
 */
export declare const SHOWN_EVENT = "entranceshown";
export declare const IN_EVENT = "entrancein";
/** The attribute that holds a container's state. */
export declare const ENTRANCE_ATTRIBUTE = "data-entrance";
/** A moment to wait for. */
export type EntranceMoment = "shown" | "in";
/** A container's state. */
export type EntranceState = "pending" | EntranceMoment;
/** What the events carry in `detail`. */
export interface EntranceEventDetail {
    element: HTMLElement;
    state: EntranceMoment;
}
/** The element's state, or `null` when nothing animates it in. */
export declare function stateOf(element: HTMLElement): EntranceState | null;
/**
 * For a plugin that animates: the element will animate in, and has not started. Whatever is inside it waits from now on.
 *
 * Call it when the element is prepared, before the slide it is on can be shown.
 */
export declare function markPending(element: HTMLElement): void;
/**
 * For a plugin that animates: the element starts coming in now. It is `shown` at its moment, half way unless it says otherwise with `data-entrance-at`, and `in` at the end. Times are in milliseconds; `delay` is what is left before it starts moving, so leave it out when calling this as it starts, for example on `animationstart`.
 */
export declare function announce(element: HTMLElement, timing: {
    duration: number;
    delay?: number;
}): void;
/**
 * For a plugin that animates: the element is hidden again, and will come in again. Anything waiting on it waits again.
 */
export declare function reset(element: HTMLElement): void;
/**
 * The element itself and its ancestors up to its slide that animate in and have not reached `moment`, nearest first.
 */
export declare function pendingAround(element: HTMLElement, moment?: EntranceMoment): HTMLElement[];
/**
 * For a plugin that waits: resolves `true` once every container around `element` (the element itself included, up to its slide) that is still coming in has reached `moment`, and at once when none is. Resolves `false` if `signal` aborts first, for example because the presenter stepped back.
 *
 * With reduced motion it resolves at once: nothing is moving, so there is nothing to wait for.
 *
 * Containers announced by a plugin that does not use this signal are not waited for. A plugin that also wants to wait for those can look at `getAnimations()` when `pendingAround` finds nothing.
 */
export declare function whenShown(element: HTMLElement, moment?: EntranceMoment, signal?: AbortSignal): Promise<boolean>;
