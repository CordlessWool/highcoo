import type { PageServerLoad } from './$types';
import { mediaRepository } from '$lib/server/db/repositories';

export const load: PageServerLoad = async () => {
	const result = await mediaRepository.findAll({ limit: 20 });

	return {
		photos: result.items,
		pagination: result.pagination
	};
};
