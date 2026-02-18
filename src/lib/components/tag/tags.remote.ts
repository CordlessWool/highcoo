import * as v from 'valibot';
import { error } from '@sveltejs/kit';
import { query, command } from '$app/server';
import { tagRepository, tagContentRepository } from '$lib/server/db/repositories';
import { UniqueConstraintError } from '$lib/server/db/errors';
import {
	TagFilter,
	NewTag,
	NewTagContent,
	type Tag,
	type TagWithStatus,
	type TagContent
} from '$lib/logic/tag';

const PartialTag = v.object({
	id: v.string(),
	name: v.optional(v.string()),
	color: v.optional(v.nullable(v.string()))
});

const PartialTagContent = v.object({
	id: v.string(),
	tagId: v.string(),
	title: v.optional(v.nullable(v.string())),
	slug: v.optional(v.string()),
	description: v.optional(v.nullable(v.string()))
});

export const getTags = query(TagFilter, async (filter): Promise<TagWithStatus[]> => {
	return tagRepository.findAll(filter);
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
		await getTags().refresh();
		return content;
	} catch (err: unknown) {
		if (err instanceof UniqueConstraintError) error(409, 'Slug is already taken');
		throw err;
	}
});

export const patchTagContent = command(PartialTagContent, async ({ id, tagId, ...data }) => {
	try {
		await tagContentRepository.patch(id, data);
		const cached = await getTagContent(tagId);
		if (cached) getTagContent(tagId).set({ ...cached, ...data, dirty: true });
	} catch (err: unknown) {
		if (err instanceof UniqueConstraintError) error(409, 'Slug is already taken');
		throw err;
	}
});

export const publishTagContent = command(v.string(), async (tagId) => {
	await tagContentRepository.publish(tagId);
	await getTags().refresh();
});
