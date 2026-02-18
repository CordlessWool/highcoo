import { eq, ilike, sql } from 'drizzle-orm';
import type { TagRepository } from './types';
import type { db as database } from '../index';
import * as table from '../schema';
import type { Tag, TagWithStatus, TagFilter, NewTag } from '$lib/logic/tag';

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

	async findAll(filter?: TagFilter): Promise<TagWithStatus[]> {
		return db
			.select({
				id: table.tag.id,
				name: table.tag.name,
				color: table.tag.color,
				hasDraft: sql<boolean>`EXISTS (
					SELECT 1 FROM tag_content
					WHERE tag_id = tag.id AND published_at IS NULL
				)`,
				isDirty: sql<boolean>`COALESCE((
					SELECT dirty FROM tag_content
					WHERE tag_id = tag.id AND published_at IS NULL
					LIMIT 1
				), false)`,
				isPublished: sql<boolean>`EXISTS (
					SELECT 1 FROM tag_content
					WHERE tag_id = tag.id AND published_at IS NOT NULL
				)`
			})
			.from(table.tag)
			.$dynamic()
			.where(filter?.search ? ilike(table.tag.name, `%${filter.search}%`) : undefined);
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
