import { json } from '@sveltejs/kit';
import * as v from 'valibot';
import type { RequestHandler } from './$types';
import { fileRepository } from '$lib/server/db/repositories';

const RestoreRequest = v.object({
	hashes: v.array(v.string())
});

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const { hashes } = v.parse(RestoreRequest, body);

	await Promise.all(hashes.map((hash) => fileRepository.restore(hash)));

	return json({ success: true, count: hashes.length });
};
