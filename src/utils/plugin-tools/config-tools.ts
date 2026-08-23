/**
 * Reading plugin config out of the page.
 *
 * Reveal plugins take per-slide settings from data attributes, which arrive as
 * strings that are nearly-but-not-quite JSON — unquoted keys, single quotes, and
 * whatever quotation marks the author's editor decided to use. These two turn
 * that into something `JSON.parse` accepts.
 */

/**
 * Whether a string parses as JSON.
 */
export const isJSON = (str: string): boolean => {
	try {
		return JSON.parse(str) && !!str;
	} catch {
		return false;
	}
};

/**
 * Convert an object, or the loose JSON people write in a data attribute, into a
 * JSON string.
 *
 * Smart quotes are replaced first — an editor or a CMS will have turned `"` into
 * `“` — and a bare `key: value` list is wrapped in braces, so
 * `data-x="delay: 100"` parses like `{"delay": 100}`.
 */
export const toJSONString = (str?: unknown): string => {
	// Nothing to convert.
	if (str == null) return '';

	let modifiedStr = str;
	if (typeof modifiedStr === 'string') {
		modifiedStr = modifiedStr.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
	}

	if (isJSON(str as string)) return str as string;

	if (typeof str === 'object') return JSON.stringify(str, null, 2);

	if (typeof str === 'string') {
		const trimmed = str.trim().replace(/'/g, '"');
		return trimmed.charAt(0) === '{' ? trimmed : `{${trimmed}}`;
	}

	return '';
};
