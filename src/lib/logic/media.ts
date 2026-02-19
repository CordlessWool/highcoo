import * as v from 'valibot';

export const MediaFilter = v.object({
	search: v.optional(v.string())
});

export type MediaFilter = v.InferOutput<typeof MediaFilter>;
