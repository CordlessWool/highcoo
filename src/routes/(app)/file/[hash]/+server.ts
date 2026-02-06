import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { storage } from '$lib/server/storage';
import { fileRepository } from '$lib/server/db/repositories';

// TODO: Restrict to authorized users only

export const HEAD: RequestHandler = async ({ params }) => {
	const file = await fileRepository.findByHash(params.hash);
	if (!file) {
		throw error(404, 'File not found');
	}

	return new Response(null, {
		headers: {
			'Content-Type': file.mimeType,
			'Content-Length': String(file.size)
		}
	});
};

export const GET: RequestHandler = async ({ params }) => {
	const file = await fileRepository.findByHash(params.hash);
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
			'Content-Length': String(file.size),
			'Cache-Control': 'public, max-age=31536000'
		}
	});
};
