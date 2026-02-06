import { json } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fileRepository } from '$lib/server/db/repositories';

// TODO: Restrict to authorized users only

export const GET: RequestHandler = async ({ params }) => {
	const file = await fileRepository.findByHash(params.hash);
	if (!file) {
		throw error(404, 'File not found');
	}

	return json({
		hash: file.hash,
		mimeType: file.mimeType,
		size: file.size,
		createdAt: file.createdAt
	});
};
