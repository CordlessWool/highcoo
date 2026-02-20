import * as v from 'valibot';

export const MEDIA_PAGE_LIMIT = 24;
export const TAG_PAGE_LIMIT = 24;

export const Pagination = v.object({
	cursor: v.optional(v.nullable(v.string())),
	limit: v.optional(v.number()),
	orderBy: v.optional(v.string())
});

export type Pagination = v.InferOutput<typeof Pagination>;

export function encodeCursor(payload: Record<string, string>): string {
	return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export function decodeCursor<T extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>>(
	cursor: string,
	schema: T
): v.InferOutput<T> | null {
	try {
		const parsed = JSON.parse(Buffer.from(cursor, 'base64').toString('utf8'));
		const result = v.safeParse(schema, parsed);
		return result.success ? result.output : null;
	} catch {
		return null;
	}
}
