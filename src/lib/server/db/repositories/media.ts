import { eq, lt, desc, isNull, and, inArray } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import type { MediaRepository, NewMedia, Pagination } from './types';
import type { db as database } from '../index';
import * as table from '../schema';
import type { Tag } from '$lib/logic/tag';

export const createMediaRepository = (db: typeof database): MediaRepository => ({
	async insert(data: NewMedia): Promise<void> {
		try {
			await db.insert(table.media).values({
				...data,
				createdAt: data.createdAt ?? new Date()
			});
		} catch (error: unknown) {
			if (!(error instanceof Error)) throw error;
			const cause = 'cause' in error ? error.cause : null;
			const isUnique =
				cause instanceof Error &&
				'extendedCode' in cause &&
				cause.extendedCode === 'SQLITE_CONSTRAINT_UNIQUE';
			if (!isUnique) throw error;

			// Slug collision - retry with nanoid suffix
			await db.insert(table.media).values({
				...data,
				slug: `${data.slug}-${nanoid(6)}`,
				createdAt: data.createdAt ?? new Date()
			});
		}
	},

	async findById(id: string) {
		const result = await db.query.media.findFirst({
			where: and(eq(table.media.id, id), isNull(table.media.deletedAt))
		});
		return result ?? null;
	},

	async findBySlug(slug: string) {
		const result = await db.query.media.findFirst({
			where: and(eq(table.media.slug, slug), isNull(table.media.deletedAt))
		});
		return result ?? null;
	},

	async findFileBySlug(slug: string) {
		const result = await db
			.select({ file: table.file })
			.from(table.media)
			.innerJoin(table.file, eq(table.media.fileHash, table.file.hash))
			.where(and(eq(table.media.slug, slug), isNull(table.media.deletedAt)))
			.limit(1);
		return result[0]?.file ?? null;
	},

	async findAll(pagination: Pagination) {
		const { limit, cursor } = pagination;

		const whereClause = cursor
			? and(isNull(table.media.deletedAt), lt(table.media.id, cursor))
			: isNull(table.media.deletedAt);

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
		await db.update(table.media).set({ deletedAt: new Date() }).where(eq(table.media.id, id));
	},

	async restore(id: string): Promise<void> {
		await db.update(table.media).set({ deletedAt: null }).where(eq(table.media.id, id));
	},

	async patch(id, data) {
		await db.update(table.media).set(data).where(eq(table.media.id, id));
	},

	async addTag(mediaIds: string[], tagId: string): Promise<void> {
		if (mediaIds.length === 0) return;
		const values = mediaIds.map((mediaId) => ({ mediaId, tagId }));
		await db.insert(table.mediaTag).values(values).onConflictDoNothing();
	},

	async removeTag(mediaIds: string[], tagId: string): Promise<void> {
		if (mediaIds.length === 0) return;
		await db
			.delete(table.mediaTag)
			.where(and(inArray(table.mediaTag.mediaId, mediaIds), eq(table.mediaTag.tagId, tagId)));
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
	}
});
