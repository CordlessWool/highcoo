import { eq, and, asc, gt, lt, isNull, isNotNull, ne, or, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import * as v from 'valibot';
import type {
	TagContentRepository,
	Pagination,
	PaginatedResult,
	PublishedTag,
	PublishedTagWithMedia
} from './types';
import type { db as database } from '../index';
import * as table from '../schema';
import type { TagContent, NewTagContent } from '$lib/logic/tag';
import { UniqueConstraintError, isUniqueViolation } from '../errors';
import { encodeCursor, decodeCursor } from '$lib/logic/pagination';

const tagContentCursorSchema = v.object({ id: v.string(), value: v.string() });
const mediaCursorSchema = v.object({ id: v.string() });

const isDraft = isNull(table.tagContent.publishedAt);
const isPublished = isNotNull(table.tagContent.publishedAt);

export const createTagContentRepository = (db: typeof database): TagContentRepository => ({
	async create(input: NewTagContent): Promise<TagContent> {
		const now = new Date();
		try {
			const [content] = await db
				.insert(table.tagContent)
				.values({
					tagId: input.tagId,
					title: input.title ?? null,
					slug: input.slug,
					description: input.description ?? null,
					updatedAt: now
				})
				.returning();
			return content;
		} catch (error: unknown) {
			const violation = isUniqueViolation(error);
			if (!violation || violation.constraint !== 'tag_content_slug_draft') throw error;

			const [content] = await db
				.insert(table.tagContent)
				.values({
					tagId: input.tagId,
					title: input.title ?? null,
					slug: `${input.slug}-${nanoid(6)}`,
					description: input.description ?? null,
					updatedAt: now
				})
				.returning();
			return content;
		}
	},

	async findByTagId(tagId: string): Promise<TagContent | null> {
		const [result] = await db
			.select()
			.from(table.tagContent)
			.where(and(eq(table.tagContent.tagId, tagId), isDraft))
			.limit(1);
		return result ?? null;
	},

	async patch(
		id: string,
		data: Partial<Omit<TagContent, 'id' | 'tagId' | 'dirty' | 'publishedAt' | 'updatedAt'>>
	): Promise<void> {
		try {
			await db
				.update(table.tagContent)
				.set({ ...data, dirty: true, updatedAt: new Date() })
				.where(eq(table.tagContent.id, id));
		} catch (error: unknown) {
			const violation = isUniqueViolation(error);
			if (violation) throw new UniqueConstraintError(violation.constraint);
			throw error;
		}
	},

	async publish(tagId: string): Promise<void> {
		const [draft] = await db
			.select()
			.from(table.tagContent)
			.where(and(eq(table.tagContent.tagId, tagId), isDraft))
			.limit(1);

		if (!draft) return;

		// Check slug not already published by a different tag
		const conflict = await db
			.select({ tagId: table.tagContent.tagId })
			.from(table.tagContent)
			.where(
				and(eq(table.tagContent.slug, draft.slug), ne(table.tagContent.tagId, tagId), isPublished)
			)
			.limit(1);

		if (conflict.length > 0) {
			throw new Error(`Slug "${draft.slug}" is already published by another tag`);
		}

		const now = new Date();

		await db.insert(table.tagContent).values({
			tagId: draft.tagId,
			title: draft.title,
			slug: draft.slug,
			description: draft.description,
			dirty: false,
			publishedAt: now,
			updatedAt: now
		});

		await db
			.update(table.tagContent)
			.set({ dirty: false })
			.where(eq(table.tagContent.id, draft.id));
	},

	async findPublishedMediaByTagSlug(
		slug: string,
		pagination?: Pagination
	): Promise<PublishedTagWithMedia | null> {
		// Find the published tag content by slug
		const [content] = await db
			.select({
				tagId: table.tagContent.tagId,
				title: table.tagContent.title,
				description: table.tagContent.description
			})
			.from(table.tagContent)
			.where(and(eq(table.tagContent.slug, slug), isPublished))
			.orderBy(desc(table.tagContent.publishedAt))
			.limit(1);

		if (!content) return null;

		// Paginate published media linked to this tag
		const limit = pagination?.limit ?? 24;
		const cursor = pagination?.cursor ? decodeCursor(pagination.cursor, mediaCursorSchema) : null;
		const cursorCond = cursor ? lt(table.media.id, cursor.id) : undefined;

		const rows = await db
			.select({
				id: table.media.id,
				name: table.media.name,
				slug: table.media.slug,
				description: table.media.description
			})
			.from(table.mediaTag)
			.innerJoin(table.media, eq(table.mediaTag.mediaId, table.media.id))
			.where(
				and(
					eq(table.mediaTag.tagId, content.tagId),
					isNotNull(table.media.publishedAt),
					isNull(table.media.deletedAt),
					cursorCond
				)
			)
			.orderBy(desc(table.media.id))
			.limit(limit + 1);

		const hasMore = rows.length > limit;
		const page = hasMore ? rows.slice(0, limit) : rows;
		const last = page[page.length - 1];

		return {
			title: content.title,
			description: content.description,
			media: {
				items: page.map((row) => ({
					name: row.name,
					slug: row.slug,
					description: row.description
				})),
				pagination: {
					limit,
					cursor: hasMore && last ? encodeCursor({ id: last.id }) : null
				}
			}
		};
	},

	async findPublishedBySlug(slug: string): Promise<TagContent | null> {
		const [result] = await db
			.select()
			.from(table.tagContent)
			.where(and(eq(table.tagContent.slug, slug), isPublished))
			.orderBy(desc(table.tagContent.publishedAt))
			.limit(1);
		return result ?? null;
	},

	async findAllPublished(pagination?: Pagination): Promise<PaginatedResult<PublishedTag>> {
		const limit = pagination?.limit ?? 24;
		const cursor = pagination?.cursor
			? decodeCursor(pagination.cursor, tagContentCursorSchema)
			: null;
		const cursorCond = cursor
			? or(
					gt(table.tagContent.slug, cursor.value),
					and(eq(table.tagContent.slug, cursor.value), gt(table.tagContent.id, cursor.id))
				)
			: undefined;

		const rows = await db
			.select({
				id: table.tagContent.id,
				slug: table.tagContent.slug,
				title: table.tagContent.title,
				description: table.tagContent.description
			})
			.from(table.tagContent)
			.where(and(isPublished, cursorCond))
			.orderBy(asc(table.tagContent.slug), asc(table.tagContent.id))
			.limit(limit + 1);

		const hasMore = rows.length > limit;
		const page = hasMore ? rows.slice(0, limit) : rows;
		const last = page[page.length - 1];
		const nextCursor =
			hasMore && last ? encodeCursor({ value: last.slug, id: last.id }) : null;

		return {
			items: page.map((row) => ({
				slug: row.slug,
				title: row.title,
				description: row.description
			})),
			pagination: { limit, orderBy: 'slug', cursor: nextCursor }
		};
	}
});
