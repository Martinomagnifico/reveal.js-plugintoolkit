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

export const SHOWN_EVENT = "entranceshown";
export const IN_EVENT = "entrancein";

/** The attribute that holds a container's state. */
export const ENTRANCE_ATTRIBUTE = "data-entrance";

/** A moment to wait for. */
export type EntranceMoment = "shown" | "in";

/** A container's state. */
export type EntranceState = "pending" | EntranceMoment;

/** What the events carry in `detail`. */
export interface EntranceEventDetail {
	element: HTMLElement;
	state: EntranceMoment;
}

const ORDER: Record<EntranceState, number> = { pending: 0, shown: 1, in: 2 };

/** The timers of an announcement still running, kept on the element so that any copy of the toolkit can call them off. */
const TIMERS = Symbol.for("reveal.js-plugintoolkit.entranceTimers");

type WithTimers = HTMLElement & { [TIMERS]?: number[] };

const reducedMotion = (): boolean =>
	typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** The element's state, or `null` when nothing animates it in. */
export function stateOf(element: HTMLElement): EntranceState | null {
	const state = element.getAttribute(ENTRANCE_ATTRIBUTE);
	return state === "pending" || state === "shown" || state === "in" ? state : null;
}

function setState(element: HTMLElement, state: EntranceState): void {
	element.setAttribute(ENTRANCE_ATTRIBUTE, state);
	if (state === "pending") return;
	const detail: EntranceEventDetail = { element, state };
	element.dispatchEvent(new CustomEvent(state === "shown" ? SHOWN_EVENT : IN_EVENT, { bubbles: true, detail }));
}

function cancel(element: WithTimers): void {
	for (const timer of element[TIMERS] ?? []) window.clearTimeout(timer);
	delete element[TIMERS];
}

/**
 * For a plugin that animates: the element will animate in, and has not started. Whatever is inside it waits from now on.
 *
 * Call it when the element is prepared, before the slide it is on can be shown.
 */
export function markPending(element: HTMLElement): void {
	cancel(element);
	setState(element, "pending");
}

/**
 * For a plugin that animates: the element starts coming in now. It is `shown` at its moment, half way unless it says otherwise with `data-entrance-at`, and `in` at the end. Times are in milliseconds; `delay` is what is left before it starts moving, so leave it out when calling this as it starts, for example on `animationstart`.
 */
export function announce(element: HTMLElement, timing: { duration: number; delay?: number }): void {
	cancel(element);
	const delay = Math.max(0, timing.delay ?? 0);
	const duration = Math.max(0, timing.duration);
	const asked = Number.parseFloat(element.dataset.entranceAt ?? "");
	const at = Number.isFinite(asked) ? Math.min(1, Math.max(0, asked)) : 0.5;
	setState(element, "pending");
	(element as WithTimers)[TIMERS] = [
		window.setTimeout(() => setState(element, "shown"), delay + duration * at),
		window.setTimeout(() => {
			// Never in before shown, even when both fall on the same moment.
			if (stateOf(element) === "pending") setState(element, "shown");
			setState(element, "in");
			delete (element as WithTimers)[TIMERS];
		}, delay + duration)
	];
}

/**
 * For a plugin that animates: the element is hidden again, and will come in again. Anything waiting on it waits again.
 */
export function reset(element: HTMLElement): void {
	markPending(element);
}

/**
 * The element itself and its ancestors up to its slide that animate in and have not reached `moment`, nearest first.
 */
export function pendingAround(element: HTMLElement, moment: EntranceMoment = "shown"): HTMLElement[] {
	const pending: HTMLElement[] = [];
	for (let node: HTMLElement | null = element; node && node.tagName !== "SECTION"; node = node.parentElement) {
		const state = stateOf(node);
		if (state && ORDER[state] < ORDER[moment]) pending.push(node);
	}
	return pending;
}

/**
 * For a plugin that waits: resolves `true` once every container around `element` (the element itself included, up to its slide) that is still coming in has reached `moment`, and at once when none is. Resolves `false` if `signal` aborts first, for example because the presenter stepped back.
 *
 * With reduced motion it resolves at once: nothing is moving, so there is nothing to wait for.
 *
 * Containers announced by a plugin that does not use this signal are not waited for. A plugin that also wants to wait for those can look at `getAnimations()` when `pendingAround` finds nothing.
 */
export function whenShown(element: HTMLElement, moment: EntranceMoment = "shown", signal?: AbortSignal): Promise<boolean> {
	if (signal?.aborted) return Promise.resolve(false);
	if (reducedMotion()) return Promise.resolve(true);

	const containers = pendingAround(element, moment);
	if (!containers.length) return Promise.resolve(true);

	return new Promise((resolve) => {
		const check = () => {
			if (pendingAround(element, moment).length) return;
			stop();
			resolve(true);
		};
		const abort = () => {
			stop();
			resolve(false);
		};
		const stop = () => {
			for (const container of containers) {
				container.removeEventListener(SHOWN_EVENT, check);
				container.removeEventListener(IN_EVENT, check);
			}
			signal?.removeEventListener("abort", abort);
		};
		for (const container of containers) {
			container.addEventListener(SHOWN_EVENT, check);
			container.addEventListener(IN_EVENT, check);
		}
		signal?.addEventListener("abort", abort);
	});
}
