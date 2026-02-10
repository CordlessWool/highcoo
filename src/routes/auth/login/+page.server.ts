import { env } from '$env/dynamic/private';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	return {
		allowRegistration: env.ALLOW_REGISTRATION === 'true'
	};
};
