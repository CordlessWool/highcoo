import * as auth from '$lib/server/auth';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	return {
		allowRegistration: auth.isRegistrationAllowed()
	};
};
