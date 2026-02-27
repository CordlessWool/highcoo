import { json, error } from '@sveltejs/kit';
import { generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import * as auth from '$lib/server/auth';
import { rpName, rpID, origin } from '$lib/server/webauthn';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
	if (!auth.isRegistrationAllowed()) {
		error(403, 'Registration is disabled');
	}

	const options = await generateRegistrationOptions({
		rpName,
		rpID,
		userName: 'user',
		authenticatorSelection: {
			residentKey: 'required',
			userVerification: 'preferred'
		}
	});

	event.cookies.set('webauthn-challenge', options.challenge, {
		path: '/auth',
		httpOnly: true,
		sameSite: 'strict',
		maxAge: 60 * 5
	});

	return json(options);
};

export const PUT: RequestHandler = async (event) => {
	if (!auth.isRegistrationAllowed()) {
		error(403, 'Registration is disabled');
	}

	const challenge = event.cookies.get('webauthn-challenge');

	if (!challenge) {
		error(400, 'Session expired. Please refresh and try again.');
	}

	const body = await event.request.json();

	const verification = await verifyRegistrationResponse({
		response: body,
		expectedChallenge: challenge,
		expectedOrigin: origin,
		expectedRPID: rpID,
		requireUserVerification: false
	});

	if (!verification.verified || !verification.registrationInfo) {
		error(400, 'Verification failed. Please try again.');
	}

	const { credential } = verification.registrationInfo;

	const [user] = await db.insert(table.user).values({}).returning({ id: table.user.id });

	await db.insert(table.credential).values({
		id: credential.id,
		userId: user.id,
		publicKey: Buffer.from(credential.publicKey),
		counter: credential.counter,
		transports: credential.transports ? JSON.stringify(credential.transports) : null
	});

	// Clean up challenge cookie
	event.cookies.delete('webauthn-challenge', { path: '/auth' });

	// Create session
	const token = auth.generateSessionToken();
	const session = await auth.createSession(token, user.id);
	auth.setSessionTokenCookie(event, token, session.expiresAt);

	return json({ verified: true });
};
