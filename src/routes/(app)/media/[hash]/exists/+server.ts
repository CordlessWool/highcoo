import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fileRepository } from '$lib/server/db/repositories';

export const GET: RequestHandler = async ({ params }) => {
	const { hash } = params;
	const exists = await fileRepository.exists(hash);
	return json({ exists });
};
