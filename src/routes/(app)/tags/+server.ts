import { json } from '@sveltejs/kit';
import * as v from 'valibot';
import type { RequestHandler } from './$types';
import { tagRepository } from '$lib/server/db/repositories';
import { NewTag } from '$lib/logic/tag';

export const GET: RequestHandler = async () => {
	const tags = await tagRepository.findAll();
	return json({ tags });
};

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const input = v.parse(NewTag, body);
	const tag = await tagRepository.create(input);
	return json({ tag }, { status: 201 });
};
