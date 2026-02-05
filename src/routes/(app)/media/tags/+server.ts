import { json, error } from '@sveltejs/kit';
import * as v from 'valibot';
import type { RequestHandler } from './$types';
import { fileRepository, tagRepository } from '$lib/server/db/repositories';

const MediaTagRequest = v.object({
	tagId: v.string(),
	hashes: v.array(v.string())
});

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const { tagId, hashes } = v.parse(MediaTagRequest, body);

	const tag = await tagRepository.findById(tagId);
	if (!tag) {
		throw error(404, 'Tag not found');
	}

	await fileRepository.addTag(hashes, tagId);
	return json({ success: true, count: hashes.length });
};

export const DELETE: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const { tagId, hashes } = v.parse(MediaTagRequest, body);

	await fileRepository.removeTag(hashes, tagId);
	return json({ success: true, count: hashes.length });
};
