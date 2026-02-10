import { redirect } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
	if (event.locals.session) {
		await auth.invalidateSession(event.locals.session.id);
	}
	auth.deleteSessionTokenCookie(event);
	redirect(303, '/auth/login');
};
