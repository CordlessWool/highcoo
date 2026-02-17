import { eq, and, isNull, isNotNull, ne, desc } from 'drizzle-orm';
import type { TagContentRepository } from './types';
import type { db as database } from '../index';
import * as table from '../schema';
import type { TagContent, NewTagContent } from '$lib/logic/tag';
import { UniqueConstraintError, isUniqueViolation } from '../errors';

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
			if (violation) throw new UniqueConstraintError(violation.constraint);
			throw error;
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

	async findPublishedBySlug(slug: string): Promise<TagContent | null> {
		const [result] = await db
			.select()
			.from(table.tagContent)
			.where(and(eq(table.tagContent.slug, slug), isPublished))
			.orderBy(desc(table.tagContent.publishedAt))
			.limit(1);
		return result ?? null;
	}
});
