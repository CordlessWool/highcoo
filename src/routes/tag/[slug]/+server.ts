import { json, error } from '@sveltejs/kit';
import { tagRepository } from '$lib/server/db/repositories';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const result = await tagRepository.findMediaByTagSlug(params.slug);
	if (!result) {
		throw error(404, 'Tag not found');
	}

	return json({
		name: result.name,
		description: result.description,
		media: result.media.map((m) => ({
			name: m.name,
			images: {
				small: `/media/${m.slug}/w/300`,
				medium: `/media/${m.slug}/w/800`,
				large: `/media/${m.slug}/w/1600`
			}
		}))
	});
};
