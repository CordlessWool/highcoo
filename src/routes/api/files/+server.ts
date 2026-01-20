import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fileRepository } from '$lib/server/db/repositories';

export const GET: RequestHandler = async ({ url }) => {
	const limit = parseInt(url.searchParams.get('limit') ?? '20');
	const cursor = url.searchParams.get('cursor') ?? undefined;

	const result = await fileRepository.findAll({ limit, cursor });

	return json(result);
};
