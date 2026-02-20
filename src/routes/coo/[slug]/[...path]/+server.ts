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

	// Parse key/value segments from path: /coo/[slug]/w/480/f/jpeg
	if (params.path) {
		const segments = params.path.split('/');
		for (let i = 0; i < segments.length - 1; i += 2) {
			if (segments[i] === 'w') query.set('w', segments[i + 1]);
			if (segments[i] === 'f') query.set('fmt', segments[i + 1]);
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
