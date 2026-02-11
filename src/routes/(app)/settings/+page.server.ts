import { mediaRepository } from '$lib/server/db/repositories';

export const load = async () => {
	const { items } = await mediaRepository.findAll({ limit: 1 });
	return { sampleMedia: items[0] ?? null };
};
