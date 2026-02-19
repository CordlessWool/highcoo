import * as v from 'valibot';

export const Pagination = v.object({
	cursor: v.optional(v.nullable(v.string())),
	limit: v.optional(v.number()),
	orderBy: v.optional(v.string())
});

export type Pagination = v.InferOutput<typeof Pagination>;
