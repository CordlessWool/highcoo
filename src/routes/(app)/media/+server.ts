import { json } from '@sveltejs/kit';
import * as v from 'valibot';
import type { RequestHandler } from './$types';
import { mediaRepository } from '$lib/server/db/repositories';

const IdsRequest = v.object({
	ids: v.array(v.string())
});

export const GET: RequestHandler = async ({ url }) => {
	const limit = Number(url.searchParams.get('limit') ?? 20);
	const cursor = url.searchParams.get('cursor') ?? undefined;

	const result = await mediaRepository.findAll({ limit, cursor });

	return json({
		photos: result.items,
		pagination: result.pagination
	});
};

export const DELETE: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const { ids } = v.parse(IdsRequest, body);

	await Promise.all(ids.map((id) => mediaRepository.softDelete(id)));

	return json({ success: true, count: ids.length });
};
