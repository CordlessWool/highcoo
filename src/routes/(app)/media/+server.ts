import { json } from '@sveltejs/kit';
import * as v from 'valibot';
import type { RequestHandler } from './$types';
import { fileRepository } from '$lib/server/db/repositories';

const HashesRequest = v.object({
	hashes: v.array(v.string())
});

export const GET: RequestHandler = async ({ url }) => {
	const limit = Number(url.searchParams.get('limit') ?? 20);
	const cursor = url.searchParams.get('cursor') ?? undefined;

	const result = await fileRepository.findAll({ limit, cursor });

	return json({
		photos: result.items,
		pagination: result.pagination
	});
};

export const DELETE: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const { hashes } = v.parse(HashesRequest, body);

	await Promise.all(hashes.map((hash) => fileRepository.softDelete(hash)));

	return json({ success: true, count: hashes.length });
};
