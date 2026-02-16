import * as v from 'valibot';

export type { Tag } from '$lib/server/db/schema';

export const NewTag = v.object({
	name: v.pipe(v.string(), v.minLength(1)),
	description: v.optional(v.string()),
	color: v.optional(v.string())
});

export type NewTag = v.InferOutput<typeof NewTag>;
