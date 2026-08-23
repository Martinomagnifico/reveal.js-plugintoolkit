/**
 * Small DOM jobs that more than one plugin needs, and that are easy to get
 * subtly different from each other.
 */

/**
 * Copy every `data-` attribute from one element to another.
 *
 * Used when a plugin replaces or wraps an element and the author's own data
 * attributes have to survive the swap.
 *
 * @param source - Element to copy from.
 * @param target - Element to copy to.
 * @param not - Attribute name to leave behind, if any.
 */
export const copyDataAttributes = (source: Element, target: Element, not?: string): void => {
	// Array.from, so the live NamedNodeMap is not walked while it changes.
	for (const attr of Array.from(source.attributes)) {
		if (attr.nodeName.startsWith('data') && (not ? attr.nodeName !== not : true)) {
			target.setAttribute(attr.nodeName, attr.nodeValue || '');
		}
	}
};

/**
 * Build an element from a string of HTML.
 *
 * `createContextualFragment` rather than `innerHTML` on a throwaway div: it
 * parses in the document's context, so `<td>` or `<li>` at the top level survive
 * instead of being dropped as invalid children of a `div`.
 *
 * @returns The first element in the string, or `null` if there is none.
 */
export const createNode = (html: string): HTMLElement | null => {
	const fragment = document.createRange().createContextualFragment(html);
	return fragment.firstElementChild as HTMLElement | null;
};
