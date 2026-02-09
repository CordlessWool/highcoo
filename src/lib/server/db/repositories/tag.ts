import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import type { TagRepository } from './types';
import type { db as database } from '../index';
import * as table from '../schema';
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

	async patch(id: string, data: Partial<Omit<Tag, 'id' | 'createdAt'>>): Promise<void> {
		await db.update(table.tag).set(data).where(eq(table.tag.id, id));
	},

	async delete(id: string): Promise<void> {
		await db.delete(table.tag).where(eq(table.tag.id, id));
	}
});
