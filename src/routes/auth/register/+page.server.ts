import { env } from '$env/dynamic/private';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	if (env.ALLOW_REGISTRATION !== 'true') {
		redirect(302, '/auth/login');
	}
};
