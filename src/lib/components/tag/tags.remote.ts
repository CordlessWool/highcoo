import * as v from 'valibot';
import { error } from '@sveltejs/kit';
import { query, command } from '$app/server';
import { tagRepository } from '$lib/server/db/repositories';
import { NewTag, type Tag } from '$lib/logic/tag';

const PartialTag = v.object({
	id: v.string(),
	name: v.optional(v.string()),
	slug: v.optional(v.string()),
	description: v.optional(v.nullable(v.string())),
	color: v.optional(v.nullable(v.string()))
});

export const getTags = query(async (): Promise<Tag[]> => {
	return tagRepository.findAll();
});

export const createTag = command(NewTag, async (input): Promise<Tag> => {
	const tag = await tagRepository.create(input);
	await getTags().refresh();
	return tag;
});

export const patchTag = command(PartialTag, async ({ id, ...data }) => {
	try {
		await tagRepository.patch(id, data);
		await getTags().refresh();
	} catch (err: unknown) {
		if (err instanceof Error) {
			const cause = 'cause' in err ? err.cause : null;
			const isUnique =
				cause instanceof Error &&
				'extendedCode' in cause &&
				cause.extendedCode === 'SQLITE_CONSTRAINT_UNIQUE';
			if (isUnique) {
				error(409, 'Slug is already taken');
			}
		}
		throw err;
	}
});
