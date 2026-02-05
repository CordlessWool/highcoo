import { query, command } from '$app/server';
import { tagRepository } from '$lib/server/db/repositories';
import { NewTag, type Tag } from '$lib/logic/tag';

export const getTags = query(async (): Promise<Tag[]> => {
	return tagRepository.findAll();
});

export const createTag = command(NewTag, async (input): Promise<Tag> => {
	const tag = await tagRepository.create(input);
	await getTags().refresh();
	return tag;
});
