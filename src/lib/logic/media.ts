import * as v from 'valibot';

export const MediaStatusValues = ['draft', 'unpublished', 'published'] as const;
export type MediaStatus = (typeof MediaStatusValues)[number];

export const MediaFilter = v.object({
	search: v.optional(v.string()),
	tagIds: v.optional(v.array(v.string())),
	status: v.optional(v.array(v.picklist(MediaStatusValues)))
});

export type MediaFilter = v.InferOutput<typeof MediaFilter>;
