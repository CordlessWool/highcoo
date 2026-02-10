import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import type { TagRepository } from './types';
import type { db as database } from '../index';
import * as table from '../schema';
import type { Tag, NewTag } from '$lib/logic/tag';
import type { Media } from '../schema';
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

	async findMediaByTagSlug(slug: string) {
		const rows = await db
			.select({
				tagName: table.tag.name,
				tagDescription: table.tag.description,
				mediaSlug: table.media.slug,
				mediaName: table.media.name
			})
			.from(table.tag)
			.leftJoin(table.mediaTag, eq(table.tag.id, table.mediaTag.tagId))
			.leftJoin(table.media, eq(table.mediaTag.mediaId, table.media.id))
			.where(eq(table.tag.slug, slug));

		if (rows.length === 0) return null;

		return {
			name: rows[0].tagName,
			description: rows[0].tagDescription,
			media: rows
				.filter((r) => r.mediaSlug !== null)
				.map((r) => ({
					slug: r.mediaSlug!,
					name: r.mediaName!
				}))
		};
	},

	async patch(id: string, data: Partial<Omit<Tag, 'id' | 'createdAt'>>): Promise<void> {
		await db.update(table.tag).set(data).where(eq(table.tag.id, id));
	},

	async delete(id: string): Promise<void> {
		await db.delete(table.tag).where(eq(table.tag.id, id));
	}
});
