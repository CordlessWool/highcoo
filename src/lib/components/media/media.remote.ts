import * as v from 'valibot';
import { command, query } from '$app/server';
import { fileRepository } from '$lib/server/db/repositories';
import type { Tag } from '$lib/logic/tag';

const AddTagToMediaInput = v.object({
	tagId: v.string(),
	hashes: v.array(v.string())
});

const RemoveTagFromMediaInput = v.object({
	tagId: v.string(),
	hashes: v.array(v.string())
});

export const addTagToMedia = command(AddTagToMediaInput, async (input) => {
	await fileRepository.addTag(input.hashes, input.tagId);
	await Promise.all(input.hashes.map((hash) => getTagsForMedia(hash).refresh()));
});

export const removeTagFromMedia = command(RemoveTagFromMediaInput, async (input) => {
	await fileRepository.removeTag(input.hashes, input.tagId);
	await Promise.all(input.hashes.map((hash) => getTagsForMedia(hash).refresh()));
});

export const getTagsForMedia = query.batch(v.string(), async (hashes: string[]) => {
	const tagMap = await fileRepository.getTagsForMany(hashes);
	return (hash: string): Tag[] => tagMap.get(hash) ?? [];
});
