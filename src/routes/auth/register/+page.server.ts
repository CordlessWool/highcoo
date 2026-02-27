import { redirect } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	if (!auth.isRegistrationAllowed()) {
		redirect(302, '/auth/login');
	}
};
