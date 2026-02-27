import { json, error } from '@sveltejs/kit';
import {
	generateAuthenticationOptions,
	verifyAuthenticationResponse
} from '@simplewebauthn/server';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import * as auth from '$lib/server/auth';
import { rpID, origin } from '$lib/server/webauthn';
import type { RequestHandler } from './$types';
import type { WebAuthnCredential } from '@simplewebauthn/server';

export const POST: RequestHandler = async (event) => {
	const options = await generateAuthenticationOptions({
		rpID,
		userVerification: 'preferred'
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
	const challenge = event.cookies.get('webauthn-challenge');

	if (!challenge) {
		error(400, 'Session expired. Please refresh and try again.');
	}

	const body = await event.request.json();

	const [credentialRecord] = await db
		.select()
		.from(table.credential)
		.where(eq(table.credential.id, body.id))
		.limit(1);

	if (!credentialRecord) {
		error(400, 'No passkey found for this device.');
	}

	const credential: WebAuthnCredential = {
		id: credentialRecord.id,
		publicKey: new Uint8Array(credentialRecord.publicKey),
		counter: credentialRecord.counter,
		transports: credentialRecord.transports ? JSON.parse(credentialRecord.transports) : undefined
	};

	const verification = await verifyAuthenticationResponse({
		response: body,
		expectedChallenge: challenge,
		expectedOrigin: origin,
		expectedRPID: rpID,
		credential,
		requireUserVerification: false
	});

	if (!verification.verified) {
		error(400, 'Verification failed. Please try again.');
	}

	// Update counter
	await db
		.update(table.credential)
		.set({ counter: verification.authenticationInfo.newCounter })
		.where(eq(table.credential.id, credentialRecord.id));

	// Clean up challenge cookie
	event.cookies.delete('webauthn-challenge', { path: '/auth' });

	// Create session
	const token = auth.generateSessionToken();
	const session = await auth.createSession(token, credentialRecord.userId);
	auth.setSessionTokenCookie(event, token, session.expiresAt);

	return json({ verified: true });
};
