import { json, error } from '@sveltejs/kit';
import { mediaRepository } from '$lib/server/db/repositories';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const result = await mediaRepository.findPublishedMetaBySlug(params.slug);

	if (!result) {
		throw error(404, 'Media not found');
	}

	return json({
		name: result.name,
		slug: result.slug,
		description: result.description,
		images: {
			small: `/coo/${result.slug}/w/480`,
			medium: `/coo/${result.slug}/w/1080`,
			large: `/coo/${result.slug}/w/2048`
		}
	});
};
