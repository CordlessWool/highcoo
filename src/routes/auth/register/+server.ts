import { json, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server';
import { nanoid } from 'nanoid';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import * as auth from '$lib/server/auth';
import { rpName, rpID, origin } from '$lib/server/webauthn';
import type { RequestHandler } from './$types';

const allowRegistration = env.ALLOW_REGISTRATION === 'true';

export const POST: RequestHandler = async (event) => {
	if (!allowRegistration) {
		error(403, 'Registration is disabled');
	}

	const userId = nanoid();

	const options = await generateRegistrationOptions({
		rpName,
		rpID,
		userName: userId,
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
	event.cookies.set('webauthn-user-id', userId, {
		path: '/auth',
		httpOnly: true,
		sameSite: 'strict',
		maxAge: 60 * 5
	});

	return json(options);
};

export const PUT: RequestHandler = async (event) => {
	if (!allowRegistration) {
		error(403, 'Registration is disabled');
	}

	const challenge = event.cookies.get('webauthn-challenge');
	const userId = event.cookies.get('webauthn-user-id');

	if (!challenge || !userId) {
		error(400, 'Missing challenge or user ID');
	}

	const body = await event.request.json();

	const verification = await verifyRegistrationResponse({
		response: body,
		expectedChallenge: challenge,
		expectedOrigin: origin,
		expectedRPID: rpID
	});

	if (!verification.verified || !verification.registrationInfo) {
		error(400, 'Verification failed');
	}

	const { credential } = verification.registrationInfo;

	await db.insert(table.user).values({
		id: userId,
		createdAt: new Date()
	});

	await db.insert(table.credential).values({
		id: credential.id,
		userId,
		publicKey: Buffer.from(credential.publicKey),
		counter: credential.counter,
		transports: credential.transports ? JSON.stringify(credential.transports) : null,
		createdAt: new Date()
	});

	// Clean up challenge cookies
	event.cookies.delete('webauthn-challenge', { path: '/auth' });
	event.cookies.delete('webauthn-user-id', { path: '/auth' });

	// Create session
	const token = auth.generateSessionToken();
	const session = await auth.createSession(token, userId);
	auth.setSessionTokenCookie(event, token, session.expiresAt);

	return json({ verified: true });
};
