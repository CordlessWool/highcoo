import * as v from 'valibot';
import { error } from '@sveltejs/kit';
import { command, query } from '$app/server';
import { mediaRepository } from '$lib/server/db/repositories';
import { UniqueConstraintError } from '$lib/server/db/errors';
import type { Tag } from '$lib/logic/tag';
import { MediaFilter } from '$lib/logic/media';
import { Pagination } from '$lib/logic/pagination';
import type { Media, PaginatedResult } from '$lib/server/db/repositories/types';

const GetMediaInput = v.object({
	filter: v.optional(MediaFilter),
	pagination: v.optional(Pagination)
});

export const getMediaIds = query(
	GetMediaInput,
	async ({ filter, pagination }): Promise<PaginatedResult<string>> => {
		return mediaRepository.findAllIds(filter, {
			limit: pagination?.limit ?? 24,
			cursor: pagination?.cursor,
			orderBy: pagination?.orderBy
		});
	}
);

export const getCurrentMediaIds = query(
	GetMediaInput,
	async ({ filter, pagination }): Promise<string[]> => {
		return mediaRepository.findCurrentIds(filter, {
			cursor: pagination?.cursor,
			orderBy: pagination?.orderBy
		});
	}
);

export const getMedia = query.batch(v.string(), async (ids: string[]) => {
	const items = await mediaRepository.findByIds(ids);
	const lookup = new Map(items.map((m) => [m.id, m]));
	return (id: string): Media => {
		const item = lookup.get(id);
		if (!item) {
			error(404, 'Not found');
		}
		return item;
	};
});

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
	await Promise.all(input.mediaIds.map((id) => getMedia(id).refresh()));
});

export const removeTagFromMedia = command(RemoveTagFromMediaInput, async (input) => {
	await mediaRepository.removeTag(input.mediaIds, input.tagId);
	await Promise.all(input.mediaIds.map((id) => getTagsForMedia(id).refresh()));
	await Promise.all(input.mediaIds.map((id) => getMedia(id).refresh()));
});

export const patchMedia = command(PartialMedia, async ({ id, ...data }) => {
	try {
		await mediaRepository.patch(id, data);
		const updated = await mediaRepository.findById(id);
		if (updated) getMedia(id).set(updated);
	} catch (err: unknown) {
		if (err instanceof UniqueConstraintError && data.slug) {
			error(409, 'Slug is already taken');
		}
		throw err;
	}
});

export const getTagsForMedia = query.batch(v.string(), async (ids: string[]) => {
	const tagMap = await mediaRepository.getTagsForMany(ids);
	return (id: string): Tag[] => tagMap.get(id) ?? [];
});

export const filterMediaIds = query(
	v.object({ ids: v.array(v.string()), filter: v.optional(MediaFilter) }),
	async ({ ids, filter }) => {
		return mediaRepository.filterIds(ids, filter);
	}
);

export const publishMedia = command(v.array(v.string()), async (ids) => {
	const count = await mediaRepository.publish(ids);
	ids.map((id) => getMedia(id).refresh());
	return count;
});

export const hasPublished = query.batch(v.string(), async (ids: string[]) => {
	const map = await mediaRepository.hasPublished(ids);
	return (id: string): boolean => map.get(id) ?? false;
});

export const softDeleteMedia = command(v.array(v.string()), async (ids) => {
	await Promise.all(ids.map((id) => mediaRepository.softDelete(id)));
});

export const restoreMedia = command(v.array(v.string()), async (ids) => {
	await Promise.all(ids.map((id) => mediaRepository.restore(id)));
	await Promise.all(ids.map((id) => getMedia(id).refresh()));
});
