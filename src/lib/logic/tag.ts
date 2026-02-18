import * as v from 'valibot';

export type { Tag, TagContent } from '$lib/server/db/schema';

export type TagWithStatus = {
	id: string;
	name: string;
	color: string | null;
	hasDraft: boolean;
	isDirty: boolean;
	isPublished: boolean;
};

export const TagFilter = v.object({
	search: v.optional(v.string())
});

export type TagFilter = v.InferOutput<typeof TagFilter>;

export const NewTag = v.object({
	name: v.pipe(v.string(), v.minLength(1)),
	color: v.optional(v.string())
});

export type NewTag = v.InferOutput<typeof NewTag>;

export const NewTagContent = v.object({
	tagId: v.string(),
	title: v.optional(v.string()),
	slug: v.pipe(v.string(), v.minLength(1)),
	description: v.optional(v.string())
});

export type NewTagContent = v.InferOutput<typeof NewTagContent>;
