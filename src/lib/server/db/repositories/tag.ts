import { eq } from 'drizzle-orm';
import type { TagRepository } from './types';
import type { db as database } from '../index';
import * as table from '../schema';
import type { Tag, NewTag } from '$lib/logic/tag';

export const createTagRepository = (db: typeof database): TagRepository => ({
	async create(input: NewTag): Promise<Tag> {
		const [tag] = await db
			.insert(table.tag)
			.values({
				name: input.name,
				color: input.color ?? null
			})
			.returning();
		return tag;
	},

	async findAll(): Promise<Tag[]> {
		return db.select().from(table.tag);
	},

	async findById(id: string): Promise<Tag | null> {
		const [result] = await db.select().from(table.tag).where(eq(table.tag.id, id)).limit(1);
		return result ?? null;
	},

	async patch(id: string, data: Partial<Omit<Tag, 'id'>>): Promise<void> {
		await db.update(table.tag).set(data).where(eq(table.tag.id, id));
	},

	async delete(id: string): Promise<void> {
		await db.delete(table.tag).where(eq(table.tag.id, id));
	}
});
