import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({}) => {
	return {
		photos: [],
		pagination: {
			total: 0
		}
	};
};
