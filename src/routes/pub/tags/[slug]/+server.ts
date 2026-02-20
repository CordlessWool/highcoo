import { json, error } from '@sveltejs/kit';
import { tagContentRepository } from '$lib/server/db/repositories';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, url }) => {
	const cursor = url.searchParams.get('cursor') ?? undefined;
	const limit = url.searchParams.has('limit')
		? Number(url.searchParams.get('limit'))
		: undefined;

	const result = await tagContentRepository.findPublishedMediaByTagSlug(params.slug, {
		cursor,
		limit
	});

	if (!result) {
		throw error(404, 'Tag not found');
	}

	return json({
		title: result.title,
		description: result.description,
		media: {
			items: result.media.items.map((m) => ({
				name: m.name,
				slug: m.slug,
				images: {
					small: `/coo/${m.slug}/w/480`,
					medium: `/coo/${m.slug}/w/1080`,
					large: `/coo/${m.slug}/w/2048`
				}
			})),
			pagination: result.media.pagination
		}
	});
};
