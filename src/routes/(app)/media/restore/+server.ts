import { json } from '@sveltejs/kit';
import * as v from 'valibot';
import type { RequestHandler } from './$types';
import { mediaRepository } from '$lib/server/db/repositories';

const RestoreRequest = v.object({
	ids: v.array(v.string())
});

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const { ids } = v.parse(RestoreRequest, body);

	await Promise.all(ids.map((id) => mediaRepository.restore(id)));

	return json({ success: true, count: ids.length });
};
