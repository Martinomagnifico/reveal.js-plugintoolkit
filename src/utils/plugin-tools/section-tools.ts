
export enum SectionType {
	HORIZONTAL = 'horizontal',    // Standalone section
	STACK = 'stack',      // Has section children (it is a vertical stack)
	VERTICAL = 'vertical',      // Is a child of a stack (a vertical slide)
	INVALID = 'invalid'   // Not a valid section
}


export const isSection = (element: HTMLElement | null): boolean => {
	return element instanceof HTMLElement && element.tagName === 'SECTION';
};

export const isStack = (element: HTMLElement): boolean => {
	if (!isSection(element)) return false;
	return Array.from(element.children).some(
		child => child instanceof HTMLElement && child.tagName === 'SECTION'
	);
};


export const isVertical = (element: HTMLElement): boolean => {
	if (!isSection(element)) return false;
	return element.parentElement instanceof HTMLElement && 
			element.parentElement.tagName === 'SECTION';
}

export const isHorizontal = (element: HTMLElement): boolean => {
	return isSection(element) && !isVertical(element) && !isStack(element);
};

export const getStack = (element: HTMLElement): HTMLElement | null => {
	if (!isSection(element)) return null;
	
	if (isVertical(element)) {
		const parent = element.parentElement;
		if (parent instanceof HTMLElement && isStack(parent)) {
			return parent;
		}
	}
	return null;
 };

export const getSectionType = (element: HTMLElement): SectionType => {
	if (!isSection(element)) return SectionType.INVALID;
	if (isVertical(element)) return SectionType.VERTICAL;
	if (isStack(element)) return SectionType.STACK;
	return SectionType.HORIZONTAL;
}
