import * as v from 'valibot';
import { error } from '@sveltejs/kit';
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
	try {
		await mediaRepository.patch(id, data);
	} catch (err: unknown) {
		if (err instanceof Error) {
			const cause = 'cause' in err ? err.cause : null;
			const isUnique =
				cause instanceof Error &&
				'extendedCode' in cause &&
				cause.extendedCode === 'SQLITE_CONSTRAINT_UNIQUE';
			if (isUnique) {
				error(409, 'Slug is already taken');
			}
		}
		throw err;
	}
});

export const getTagsForMedia = query.batch(v.string(), async (ids: string[]) => {
	const tagMap = await mediaRepository.getTagsForMany(ids);
	return (id: string): Tag[] => tagMap.get(id) ?? [];
});

export const publishMedia = command(v.array(v.string()), async (ids) => {
	return mediaRepository.publish(ids);
});
