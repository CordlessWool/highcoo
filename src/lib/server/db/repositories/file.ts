import { eq, lt, desc } from 'drizzle-orm';
import type { FileRepository, NewFile, Pagination } from './types';
import type { db as database } from '../index';
import { file } from '../schema';

export const createFileRepository = (db: typeof database): FileRepository => ({
	async insert(data: NewFile): Promise<void> {
		await db.insert(file).values({
			...data,
			createdAt: data.createdAt ?? new Date()
		});
	},

	async findByHash(hash: string) {
		const result = await db.query.file.findFirst({
			where: eq(file.hash, hash)
		});
		return result ?? null;
	},

	async findBySlug(slug: string) {
		const result = await db.query.file.findFirst({
			where: eq(file.slug, slug)
		});
		return result ?? null;
	},

	async exists(hash: string): Promise<boolean> {
		const result = await this.findByHash(hash);
		return !!result;
	},

	async findAll(pagination: Pagination) {
		const { limit, cursor } = pagination;

		const items = await db
			.select()
			.from(file)
			.where(cursor ? lt(file.hash, cursor) : undefined)
			.orderBy(desc(file.hash))
			.limit(limit + 1);

		const hasMore = items.length > limit;
		const results = hasMore ? items.slice(0, -1) : items;
		const lastItem = results[results.length - 1];
		const nextCursor = hasMore && lastItem ? lastItem.hash : null;

		return {
			items: results,
			pagination: { limit, cursor: nextCursor }
		};
	}
});
