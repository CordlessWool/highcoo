import type { PageServerLoad } from './$types';
import { fileRepository } from '$lib/server/db/repositories';

export const load: PageServerLoad = async () => {
	const result = await fileRepository.findAll({ limit: 20 });

	return {
		photos: result.items,
		pagination: result.pagination
	};
};
