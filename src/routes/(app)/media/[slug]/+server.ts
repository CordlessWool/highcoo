import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { storage } from '$lib/server/storage';
import { mediaRepository } from '$lib/server/db/repositories';

export const GET: RequestHandler = async ({ params }) => {
	const file = await mediaRepository.findFileBySlug(params.slug);
	if (!file) {
		throw error(404, 'Media not found');
	}

	const stream = await storage.get(file.path);
	if (!stream) {
		throw error(404, 'File not found in storage');
	}

	return new Response(stream, {
		headers: {
			'Content-Type': file.mimeType,
			'Cache-Control': 'public, max-age=31536000'
		}
	});
};
