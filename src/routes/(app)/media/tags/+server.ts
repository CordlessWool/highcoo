import { json, error } from '@sveltejs/kit';
import * as v from 'valibot';
import type { RequestHandler } from './$types';
import { mediaRepository, tagRepository } from '$lib/server/db/repositories';

const MediaTagRequest = v.object({
	tagId: v.string(),
	mediaIds: v.array(v.string())
});

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const { tagId, mediaIds } = v.parse(MediaTagRequest, body);

	const tag = await tagRepository.findById(tagId);
	if (!tag) {
		throw error(404, 'Tag not found');
	}

	await mediaRepository.addTag(mediaIds, tagId);
	return json({ success: true, count: mediaIds.length });
};

export const DELETE: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const { tagId, mediaIds } = v.parse(MediaTagRequest, body);

	await mediaRepository.removeTag(mediaIds, tagId);
	return json({ success: true, count: mediaIds.length });
};
