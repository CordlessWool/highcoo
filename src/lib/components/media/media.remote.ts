import * as v from 'valibot';
import { command, query } from '$app/server';
import { mediaRepository } from '$lib/server/db/repositories';
import type { Tag } from '$lib/logic/tag';

const AddTagToMediaInput = v.object({
	tagId: v.string(),
	mediaIds: v.array(v.string())
});

const RemoveTagFromMediaInput = v.object({
	tagId: v.string(),
	mediaIds: v.array(v.string())
});

const PartialMedia = v.object({
	id: v.string(),
	name: v.optional(v.string()),
	slug: v.optional(v.string()),
	description: v.optional(v.nullable(v.string()))
});

export const addTagToMedia = command(AddTagToMediaInput, async (input) => {
	await mediaRepository.addTag(input.mediaIds, input.tagId);
	await Promise.all(input.mediaIds.map((id) => getTagsForMedia(id).refresh()));
});

export const removeTagFromMedia = command(RemoveTagFromMediaInput, async (input) => {
	await mediaRepository.removeTag(input.mediaIds, input.tagId);
	await Promise.all(input.mediaIds.map((id) => getTagsForMedia(id).refresh()));
});

export const patchMedia = command(PartialMedia, async ({ id, ...data }) => {
	await mediaRepository.patch(id, data);
});

export const getTagsForMedia = query.batch(v.string(), async (ids: string[]) => {
	const tagMap = await mediaRepository.getTagsForMany(ids);
	return (id: string): Tag[] => tagMap.get(id) ?? [];
});
