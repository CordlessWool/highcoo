import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { mediaRepository, settingsRepository } from '$lib/server/db/repositories';

export const GET: RequestHandler = async ({ params, fetch }) => {
	const file = await mediaRepository.findPublishedBySlug(params.slug);
	if (!file) {
		throw error(404, 'Media not found');
	}

	// Build query params
	const query = new URLSearchParams();

	// Parse width from path: /coo/[slug]/w/300
	if (params.path) {
		const segments = params.path.split('/');
		if (segments[0] === 'w' && segments[1]) {
			query.set('w', segments[1]);
		}
	}

	// Add watermark params from settings
	const settings = await settingsRepository.get();
	if (settings.watermarkFileHash) {
		query.set('wm', settings.watermarkFileHash);
		query.set('wm_pos', settings.watermarkPosition);
		query.set('wm_opacity', String(settings.watermarkOpacity));
	}

	const qs = query.toString();
	const res = await fetch(`/file/${file.hash}${qs ? `?${qs}` : ''}`);
	if (!res.ok) {
		throw error(res.status, 'Failed to load file');
	}

	return new Response(res.body, {
		headers: {
			'Content-Type': res.headers.get('Content-Type') ?? file.mimeType,
			'Cache-Control': 'public, max-age=2592000'
		}
	});
};
