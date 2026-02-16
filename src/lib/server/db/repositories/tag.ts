import { eq, isNotNull, max } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import type { TagRepository } from './types';
import type { db as database } from '../index';
import * as table from '../schema';
import { UniqueConstraintError, isUniqueViolation } from '../errors';
import type { Tag, NewTag } from '$lib/logic/tag';
import { generateSlug } from '$lib/logic/slug';

export const createTagRepository = (db: typeof database): TagRepository => ({
	async create(input: NewTag): Promise<Tag> {
		const id = nanoid();
		const newTag = {
			id,
			name: input.name,
			slug: generateSlug(input.name),
			description: input.description ?? null,
			color: input.color ?? null,
			createdAt: new Date()
		};
		await db.insert(table.tag).values(newTag);
		return newTag;
	},

	async findAll(): Promise<Tag[]> {
		return db.select().from(table.tag);
	},

	async findById(id: string): Promise<Tag | null> {
		const [result] = await db.select().from(table.tag).where(eq(table.tag.id, id)).limit(1);
		return result ?? null;
	},

	async findBySlug(slug: string): Promise<Tag | null> {
		const [result] = await db.select().from(table.tag).where(eq(table.tag.slug, slug)).limit(1);
		return result ?? null;
	},

	async findPublishedMediaByTagSlug(slug: string) {
		// Subquery: latest published row per fileHash (SQLite picks id/slug/name from the MAX row)
		const latestPublished = db
			.select({
				id: table.media.id,
				slug: table.media.slug,
				name: table.media.name,
				_max: max(table.media.publishedAt).as('max_published_at')
			})
			.from(table.media)
			.where(isNotNull(table.media.publishedAt))
			.groupBy(table.media.fileHash)
			.as('latest_published');

		const rows = await db
			.select({
				tagName: table.tag.name,
				tagDescription: table.tag.description,
				mediaSlug: latestPublished.slug,
				mediaName: latestPublished.name
			})
			.from(table.tag)
			.leftJoin(table.mediaTag, eq(table.tag.id, table.mediaTag.tagId))
			.leftJoin(latestPublished, eq(table.mediaTag.mediaId, latestPublished.id))
			.where(eq(table.tag.slug, slug));

		if (rows.length === 0) return null;

		return {
			name: rows[0].tagName,
			description: rows[0].tagDescription,
			media: rows
				.filter((r) => r.mediaSlug !== null)
				.map((r) => ({ slug: r.mediaSlug!, name: r.mediaName! }))
		};
	},

	async patch(id: string, data: Partial<Omit<Tag, 'id' | 'createdAt'>>): Promise<void> {
		try {
			await db.update(table.tag).set(data).where(eq(table.tag.id, id));
		} catch (error: unknown) {
			const violation = isUniqueViolation(error);
			if (violation) throw new UniqueConstraintError(violation.constraint);
			throw error;
		}
	},

	async delete(id: string): Promise<void> {
		await db.delete(table.tag).where(eq(table.tag.id, id));
	}
});
