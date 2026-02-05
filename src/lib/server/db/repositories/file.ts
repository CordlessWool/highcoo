import { eq, lt, desc, isNull, and, inArray } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import type { FileRepository, NewFile, Pagination } from './types';
import type { db as database } from '../index';
import * as table from '../schema';
import type { Tag } from '$lib/logic/tag';

const isUniqueConstraint = (error: unknown): boolean => {
	if (!(error instanceof Error)) return false;
	const cause = 'cause' in error ? error.cause : null;
	return (
		cause instanceof Error &&
		'extendedCode' in cause &&
		cause.extendedCode === 'SQLITE_CONSTRAINT_UNIQUE'
	);
};

export const createFileRepository = (db: typeof database): FileRepository => ({
	async insert(data: NewFile): Promise<void> {
		try {
			await db.insert(table.file).values({
				...data,
				createdAt: data.createdAt ?? new Date()
			});
		} catch (error: unknown) {
			if (!isUniqueConstraint(error)) throw error;

			// Check if it's a hash collision (same file re-uploaded)
			const existingByHash = await db.query.file.findFirst({
				where: eq(table.file.hash, data.hash)
			});

			if (existingByHash) {
				if (existingByHash.deletedAt) {
					await db
						.update(table.file)
						.set({ deletedAt: null })
						.where(eq(table.file.hash, data.hash));
				}
				return;
			}

			// Slug collision - retry with nanoid suffix
			await db.insert(table.file).values({
				...data,
				slug: `${data.slug}-${nanoid(6)}`,
				createdAt: data.createdAt ?? new Date()
			});
		}
	},

	async findByHash(hash: string) {
		const result = await db.query.file.findFirst({
			where: and(eq(table.file.hash, hash), isNull(table.file.deletedAt))
		});
		return result ?? null;
	},

	async findBySlug(slug: string) {
		const result = await db.query.file.findFirst({
			where: and(eq(table.file.slug, slug), isNull(table.file.deletedAt))
		});
		return result ?? null;
	},

	async exists(hash: string): Promise<boolean> {
		const result = await this.findByHash(hash);
		return !!result;
	},

	async findAll(pagination: Pagination) {
		const { limit, cursor } = pagination;

		const whereClause = cursor
			? and(isNull(table.file.deletedAt), lt(table.file.hash, cursor))
			: isNull(table.file.deletedAt);

		const items = await db
			.select()
			.from(table.file)
			.where(whereClause)
			.orderBy(desc(table.file.hash))
			.limit(limit + 1);

		const hasMore = items.length > limit;
		const results = hasMore ? items.slice(0, -1) : items;
		const lastItem = results[results.length - 1];
		const nextCursor = hasMore && lastItem ? lastItem.hash : null;

		return {
			items: results,
			pagination: { limit, cursor: nextCursor }
		};
	},

	async softDelete(hash: string): Promise<void> {
		await db.update(table.file).set({ deletedAt: new Date() }).where(eq(table.file.hash, hash));
	},

	async restore(hash: string): Promise<void> {
		await db.update(table.file).set({ deletedAt: null }).where(eq(table.file.hash, hash));
	},

	async addTag(mediaHashes: string[], tagId: string): Promise<void> {
		if (mediaHashes.length === 0) return;
		const values = mediaHashes.map((mediaHash) => ({ mediaHash, tagId }));
		await db.insert(table.mediaTag).values(values).onConflictDoNothing();
	},

	async removeTag(mediaHashes: string[], tagId: string): Promise<void> {
		if (mediaHashes.length === 0) return;
		await db
			.delete(table.mediaTag)
			.where(and(inArray(table.mediaTag.mediaHash, mediaHashes), eq(table.mediaTag.tagId, tagId)));
	},

	async getTags(mediaHash: string): Promise<Tag[]> {
		const results = await db
			.select({ tag: table.tag })
			.from(table.mediaTag)
			.innerJoin(table.tag, eq(table.mediaTag.tagId, table.tag.id))
			.where(eq(table.mediaTag.mediaHash, mediaHash));
		return results.map((r) => r.tag);
	},

	async getTagsForMany(mediaHashes: string[]): Promise<Map<string, Tag[]>> {
		if (mediaHashes.length === 0) return new Map();

		const results = await db
			.select({ mediaHash: table.mediaTag.mediaHash, tag: table.tag })
			.from(table.mediaTag)
			.innerJoin(table.tag, eq(table.mediaTag.tagId, table.tag.id))
			.where(inArray(table.mediaTag.mediaHash, mediaHashes));

		const map = new Map<string, Tag[]>();
		for (const hash of mediaHashes) {
			map.set(hash, []);
		}
		for (const row of results) {
			map.get(row.mediaHash)?.push(row.tag);
		}
		return map;
	}
});
