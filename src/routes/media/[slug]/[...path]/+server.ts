import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { mediaRepository } from '$lib/server/db/repositories';

export const GET: RequestHandler = async ({ params, fetch }) => {
	const file = await mediaRepository.findFileBySlug(params.slug);
	if (!file) {
		throw error(404, 'Media not found');
	}

	// Parse width from path: /media/[slug]/w/300
	let query = '';
	if (params.path) {
		const segments = params.path.split('/');
		if (segments[0] === 'w' && segments[1]) {
			query = `?w=${segments[1]}`;
		}
	}

	const res = await fetch(`/file/${file.hash}${query}`);
	if (!res.ok) {
		throw error(res.status, 'Failed to load file');
	}

	return new Response(res.body, {
		headers: {
			'Content-Type': res.headers.get('Content-Type') ?? file.mimeType,
			'Content-Length': res.headers.get('Content-Length') ?? '',
			'Cache-Control': 'public, max-age=2592000'
		}
	});
};
