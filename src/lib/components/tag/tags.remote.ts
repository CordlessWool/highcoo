import * as v from 'valibot';
import { error } from '@sveltejs/kit';
import { query, command } from '$app/server';
import { tagRepository, tagContentRepository } from '$lib/server/db/repositories';
import { UniqueConstraintError } from '$lib/server/db/errors';
import type { PaginatedResult } from '$lib/server/db/repositories/types';
import {
	TagFilter,
	NewTag,
	NewTagContent,
	type Tag,
	type TagWithStatus,
	type TagContent
} from '$lib/logic/tag';
import { Pagination } from '$lib/logic/pagination';

const GetTagsInput = v.object({
	filter: v.optional(TagFilter),
	pagination: v.optional(Pagination)
});

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

export const getTags = query(
	GetTagsInput,
	async ({ filter, pagination }): Promise<PaginatedResult<Tag>> => {
		return tagRepository.findAll(filter, {
			limit: pagination?.limit ?? 24,
			cursor: pagination?.cursor,
			orderBy: pagination?.orderBy
		});
	}
);

export const getTagIds = query(
	GetTagsInput,
	async ({ filter, pagination }): Promise<PaginatedResult<string>> => {
		return tagRepository.findAllIds(filter, {
			limit: pagination?.limit ?? 24,
			cursor: pagination?.cursor,
			orderBy: pagination?.orderBy
		});
	}
);

const GetIdsBeforeInput = v.object({
	filter: v.optional(TagFilter),
	pagination: v.optional(Pagination)
});

export const getCurrentIds = query(
	GetIdsBeforeInput,
	async ({ filter, pagination }): Promise<string[]> => {
		return tagRepository.findCurrentIds(filter, {
			cursor: pagination?.cursor,
			orderBy: pagination?.orderBy
		});
	}
);

export const getTagWithStatus = query.batch(v.string(), async (ids: string[]) => {
	const tags = await tagRepository.findWithStatusByIds(ids);
	const map = new Map(tags.map((t) => [t.id, t]));
	return (id: string): TagWithStatus | null => map.get(id) ?? null;
});

export const createTag = command(NewTag, async (input): Promise<Tag> => {
	const tag = await tagRepository.create(input);
	return tag;
});

export const patchTag = command(PartialTag, async ({ id, ...data }) => {
	await tagRepository.patch(id, data);
	await getTagWithStatus(id).refresh();
});

export const getTagContent = query(v.string(), async (tagId): Promise<TagContent | null> => {
	return tagContentRepository.findByTagId(tagId);
});

export const createTagContent = command(NewTagContent, async (input): Promise<TagContent> => {
	try {
		const content = await tagContentRepository.create(input);
		await getTagWithStatus(input.tagId).refresh();
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
		if (cached && !cached.dirty) getTagContent(tagId).set({ ...cached, dirty: true });
		const cachedStatus = await getTagWithStatus(tagId);
		if (cachedStatus && !cachedStatus.isDirty)
			getTagWithStatus(tagId).set({ ...cachedStatus, isDirty: true });
	} catch (err: unknown) {
		if (err instanceof UniqueConstraintError) error(409, 'Slug is already taken');
		throw err;
	}
});

export const publishTagContent = command(v.string(), async (tagId) => {
	await tagContentRepository.publish(tagId);
	await getTagWithStatus(tagId).refresh();
});
