import * as v from 'valibot';
import { error } from '@sveltejs/kit';
import { query, command } from '$app/server';
import { tagRepository, tagContentRepository } from '$lib/server/db/repositories';
import { UniqueConstraintError } from '$lib/server/db/errors';
import { NewTag, NewTagContent, type Tag, type TagContent } from '$lib/logic/tag';

const PartialTag = v.object({
	id: v.string(),
	name: v.optional(v.string()),
	color: v.optional(v.nullable(v.string()))
});

const PartialTagContent = v.object({
	id: v.string(),
	title: v.optional(v.string()),
	slug: v.optional(v.string()),
	description: v.optional(v.nullable(v.string()))
});

export const getTags = query(async (): Promise<Tag[]> => {
	return tagRepository.findAll();
});

export const createTag = command(NewTag, async (input): Promise<Tag> => {
	const tag = await tagRepository.create(input);
	await getTags().refresh();
	return tag;
});

export const patchTag = command(PartialTag, async ({ id, ...data }) => {
	await tagRepository.patch(id, data);
	await getTags().refresh();
});

export const getTagContent = query(v.string(), async (tagId): Promise<TagContent | null> => {
	return tagContentRepository.findByTagId(tagId);
});

export const createTagContent = command(NewTagContent, async (input): Promise<TagContent> => {
	try {
		const content = await tagContentRepository.create(input);
		return content;
	} catch (err: unknown) {
		if (err instanceof UniqueConstraintError) error(409, 'Slug is already taken');
		throw err;
	}
});

export const patchTagContent = command(PartialTagContent, async ({ id, ...data }) => {
	try {
		await tagContentRepository.patch(id, data);
	} catch (err: unknown) {
		if (err instanceof UniqueConstraintError) error(409, 'Slug is already taken');
		throw err;
	}
});

export const publishTagContent = command(v.string(), async (tagId) => {
	await tagContentRepository.publish(tagId);
});
