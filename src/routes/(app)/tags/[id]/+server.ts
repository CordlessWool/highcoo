import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { tagRepository } from '$lib/server/db/repositories';

export const GET: RequestHandler = async ({ params }) => {
	const tag = await tagRepository.findById(params.id);
	if (!tag) {
		throw error(404, 'Tag not found');
	}
	return json({ tag });
};

export const DELETE: RequestHandler = async ({ params }) => {
	const tag = await tagRepository.findById(params.id);
	if (!tag) {
		throw error(404, 'Tag not found');
	}
	await tagRepository.delete(params.id);
	return json({ success: true });
};
