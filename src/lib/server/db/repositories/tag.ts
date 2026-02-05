import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import type { TagRepository } from './types';
import type { db as database } from '../index';
import * as table from '../schema';
import type { Tag, NewTag } from '$lib/logic/tag';

export const createTagRepository = (db: typeof database): TagRepository => ({
	async create(input: NewTag): Promise<Tag> {
		const id = nanoid();
		const newTag = {
			id,
			name: input.name,
			slug: input.slug ?? null,
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
		const result = await db.query.tag.findFirst({
			where: eq(table.tag.id, id)
		});
		return result ?? null;
	},

	async findBySlug(slug: string): Promise<Tag | null> {
		const result = await db.query.tag.findFirst({
			where: eq(table.tag.slug, slug)
		});
		return result ?? null;
	},

	async delete(id: string): Promise<void> {
		await db.delete(table.tag).where(eq(table.tag.id, id));
	}
});
