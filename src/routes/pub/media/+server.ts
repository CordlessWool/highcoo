import { json } from '@sveltejs/kit';
import { mediaRepository } from '$lib/server/db/repositories';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const cursor = url.searchParams.get('cursor') ?? undefined;
	const limit = url.searchParams.has('limit')
		? Number(url.searchParams.get('limit'))
		: undefined;

	const result = await mediaRepository.findAllPublished({ cursor, limit });

	return json({
		items: result.items.map((m) => ({
			name: m.name,
			slug: m.slug,
			description: m.description,
			images: {
				small: `/coo/${m.slug}/w/480`,
				medium: `/coo/${m.slug}/w/1080`,
				large: `/coo/${m.slug}/w/2048`
			}
		})),
		pagination: result.pagination
	});
};
