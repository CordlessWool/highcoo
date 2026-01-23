import { eq, lt, desc, isNull, isNotNull, and } from 'drizzle-orm';
import type { FileRepository, NewFile, Pagination } from './types';
import type { db as database } from '../index';
import { file } from '../schema';

export const createFileRepository = (db: typeof database): FileRepository => ({
	async insert(data: NewFile): Promise<void> {
		try {
			await db.insert(file).values({
				...data,
				createdAt: data.createdAt ?? new Date()
			});
		} catch (error) {
			console.log('Insert error:', error);
			// TODO: check error type, if exists and deleted -> restore
		}
	},

	async findByHash(hash: string) {
		const result = await db.query.file.findFirst({
			where: and(eq(file.hash, hash), isNull(file.deletedAt))
		});
		return result ?? null;
	},

	async findBySlug(slug: string) {
		const result = await db.query.file.findFirst({
			where: and(eq(file.slug, slug), isNull(file.deletedAt))
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
			? and(isNull(file.deletedAt), lt(file.hash, cursor))
			: isNull(file.deletedAt);

		const items = await db
			.select()
			.from(file)
			.where(whereClause)
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
	},

	async softDelete(hash: string): Promise<void> {
		await db.update(file).set({ deletedAt: new Date() }).where(eq(file.hash, hash));
	},

	async restore(hash: string): Promise<void> {
		await db.update(file).set({ deletedAt: null }).where(eq(file.hash, hash));
	}
});
