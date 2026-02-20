import { json } from '@sveltejs/kit';
import { tagContentRepository } from '$lib/server/db/repositories';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const cursor = url.searchParams.get('cursor') ?? undefined;
	const limit = url.searchParams.has('limit')
		? Number(url.searchParams.get('limit'))
		: undefined;

	const result = await tagContentRepository.findAllPublished({ cursor, limit });

	return json(result);
};
