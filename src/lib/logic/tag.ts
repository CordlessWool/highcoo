import * as v from 'valibot';

export const Tag = v.object({
	id: v.string(),
	name: v.string(),
	slug: v.nullable(v.string()),
	description: v.nullable(v.string()),
	color: v.nullable(v.string()),
	createdAt: v.date()
});

export type Tag = v.InferOutput<typeof Tag>;

export const NewTag = v.object({
	name: v.pipe(v.string(), v.minLength(1)),
	slug: v.optional(v.pipe(v.string(), v.minLength(1))),
	description: v.optional(v.string()),
	color: v.optional(v.string())
});

export type NewTag = v.InferOutput<typeof NewTag>;
