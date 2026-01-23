import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { storage } from '$lib/server/storage';
import { fileRepository } from '$lib/server/db/repositories';

// TODO: Add auth check - external access without session should get watermarked image

export const GET: RequestHandler = async ({ params }) => {
	const { slug } = params;

	const file = await fileRepository.findBySlug(slug);
	if (!file) {
		throw error(404, 'File not found');
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
