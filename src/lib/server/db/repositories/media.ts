import { eq, lt, desc, isNull, isNotNull, and, inArray, notInArray } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import type { MediaRepository, NewMedia, Pagination } from './types';
import type { db as database } from '../index';
import * as table from '../schema';
import { UniqueConstraintError, isUniqueViolation } from '../errors';
import type { Tag } from '$lib/logic/tag';

const isDraft = isNull(table.media.publishedAt);
const isPublished = isNotNull(table.media.publishedAt);
const isNotDeleted = isNull(table.media.deletedAt);

export const createMediaRepository = (db: typeof database): MediaRepository => ({
	async insert(data: NewMedia): Promise<string> {
		const now = new Date();
		try {
			const [row] = await db
				.insert(table.media)
				.values({ ...data, updatedAt: now })
				.returning({ id: table.media.id });
			return row.id;
		} catch (error: unknown) {
			const violation = isUniqueViolation(error);
			if (!violation || violation.constraint !== 'media_slug_draft') throw error;

			const [row] = await db
				.insert(table.media)
				.values({ ...data, slug: `${data.slug}-${nanoid(6)}`, updatedAt: now })
				.returning({ id: table.media.id });
			return row.id;
		}
	},

	async findById(id: string) {
		const [result] = await db
			.select()
			.from(table.media)
			.where(and(eq(table.media.id, id), isNotDeleted))
			.limit(1);
		return result ?? null;
	},

	async findBySlug(slug: string) {
		const [result] = await db
			.select()
			.from(table.media)
			.where(and(eq(table.media.slug, slug), isDraft, isNotDeleted))
			.limit(1);
		return result ?? null;
	},

	async findFileBySlug(slug: string) {
		const result = await db
			.select({ file: table.file })
			.from(table.media)
			.innerJoin(table.file, eq(table.media.fileHash, table.file.hash))
			.where(and(eq(table.media.slug, slug), isDraft, isNotDeleted))
			.limit(1);
		return result[0]?.file ?? null;
	},

	async findAll(pagination: Pagination) {
		const { limit, cursor } = pagination;

		const whereClause = cursor
			? and(isDraft, isNotDeleted, lt(table.media.id, cursor))
			: and(isDraft, isNotDeleted);

		const items = await db
			.select()
			.from(table.media)
			.where(whereClause)
			.orderBy(desc(table.media.id))
			.limit(limit + 1);

		const hasMore = items.length > limit;
		const results = hasMore ? items.slice(0, -1) : items;
		const lastItem = results[results.length - 1];
		const nextCursor = hasMore && lastItem ? lastItem.id : null;

		return {
			items: results,
			pagination: { limit, cursor: nextCursor }
		};
	},

	async softDelete(id: string): Promise<void> {
		const [draft] = await db.select().from(table.media).where(eq(table.media.id, id)).limit(1);
		if (!draft) return;
		const now = new Date();
		await db
			.update(table.media)
			.set({ deletedAt: now, updatedAt: now })
			.where(eq(table.media.fileHash, draft.fileHash));
	},

	async restore(id: string): Promise<void> {
		const [draft] = await db.select().from(table.media).where(eq(table.media.id, id)).limit(1);
		if (!draft) return;
		const now = new Date();
		await db
			.update(table.media)
			.set({ deletedAt: null, updatedAt: now, dirty: true })
			.where(eq(table.media.fileHash, draft.fileHash));
	},

	async patch(id, data) {
		try {
			await db
				.update(table.media)
				.set({ ...data, updatedAt: new Date(), dirty: true })
				.where(eq(table.media.id, id));
		} catch (error: unknown) {
			const violation = isUniqueViolation(error);
			if (violation) throw new UniqueConstraintError(violation.constraint);
			throw error;
		}
	},

	async addTag(mediaIds: string[], tagId: string): Promise<void> {
		if (mediaIds.length === 0) return;
		const values = mediaIds.map((mediaId) => ({ mediaId, tagId }));
		await db.insert(table.mediaTag).values(values).onConflictDoNothing();
		await db
			.update(table.media)
			.set({ updatedAt: new Date(), dirty: true })
			.where(inArray(table.media.id, mediaIds));
	},

	async removeTag(mediaIds: string[], tagId: string): Promise<void> {
		if (mediaIds.length === 0) return;
		await db
			.delete(table.mediaTag)
			.where(and(inArray(table.mediaTag.mediaId, mediaIds), eq(table.mediaTag.tagId, tagId)));
		await db
			.update(table.media)
			.set({ updatedAt: new Date(), dirty: true })
			.where(inArray(table.media.id, mediaIds));
	},

	async getTags(mediaId: string): Promise<Tag[]> {
		const results = await db
			.select({ tag: table.tag })
			.from(table.mediaTag)
			.innerJoin(table.tag, eq(table.mediaTag.tagId, table.tag.id))
			.where(eq(table.mediaTag.mediaId, mediaId));
		return results.map((r) => r.tag);
	},

	async getTagsForMany(mediaIds: string[]): Promise<Map<string, Tag[]>> {
		if (mediaIds.length === 0) return new Map();

		const results = await db
			.select({ mediaId: table.mediaTag.mediaId, tag: table.tag })
			.from(table.mediaTag)
			.innerJoin(table.tag, eq(table.mediaTag.tagId, table.tag.id))
			.where(inArray(table.mediaTag.mediaId, mediaIds));

		const map = new Map<string, Tag[]>();
		for (const id of mediaIds) {
			map.set(id, []);
		}
		for (const row of results) {
			map.get(row.mediaId)?.push(row.tag);
		}
		return map;
	},

	async publish(ids: string[]): Promise<number> {
		if (ids.length === 0) return 0;

		const drafts = await db
			.select()
			.from(table.media)
			.where(and(inArray(table.media.id, ids), isDraft, isNotDeleted));

		if (drafts.length === 0) return 0;

		// Slugs within the batch are already unique (enforced by draft partial unique index).
		// Only check against published versions of files NOT in this batch.
		const batchFileHashes = drafts.map((d) => d.fileHash);

		for (const draft of drafts) {
			const conflict = await db
				.select({ fileHash: table.media.fileHash })
				.from(table.media)
				.where(
					and(
						eq(table.media.slug, draft.slug),
						notInArray(table.media.fileHash, batchFileHashes),
						isPublished,
						isNotDeleted
					)
				)
				.limit(1);

			if (conflict.length > 0) {
				throw new Error(`Slug "${draft.slug}" is already published by another image`);
			}
		}

		const now = new Date();

		for (const draft of drafts) {
			const [published] = await db
				.insert(table.media)
				.values({
					fileHash: draft.fileHash,
					name: draft.name,
					slug: draft.slug,
					description: draft.description,
					dirty: false,
					publishedAt: now,
					updatedAt: now
				})
				.returning({ id: table.media.id });

			// Copy tag associations
			const tags = await db
				.select({ tagId: table.mediaTag.tagId })
				.from(table.mediaTag)
				.where(eq(table.mediaTag.mediaId, draft.id));

			if (tags.length > 0) {
				await db
					.insert(table.mediaTag)
					.values(tags.map((t) => ({ mediaId: published.id, tagId: t.tagId })));
			}
		}

		// Clear dirty flag on all published drafts
		await db.update(table.media).set({ dirty: false }).where(inArray(table.media.id, ids));

		return drafts.length;
	},

	async findPublishedBySlug(slug: string) {
		const result = await db
			.select({ file: table.file })
			.from(table.media)
			.innerJoin(table.file, eq(table.media.fileHash, table.file.hash))
			.where(and(eq(table.media.slug, slug), isPublished, isNotDeleted))
			.orderBy(desc(table.media.publishedAt))
			.limit(1);
		return result[0]?.file ?? null;
	}
});
