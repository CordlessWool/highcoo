import { getContext, setContext } from 'svelte';

const TAG_INPUT_KEY = Symbol('tag-input');

export type TagInputContext = {
	value: string[];
	allTags: string[];
};

export function setTagInputContext(ctx: TagInputContext) {
	setContext(TAG_INPUT_KEY, ctx);
}

export function getTagInputContext(): TagInputContext {
	return getContext(TAG_INPUT_KEY);
}
