import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:4173';

test('register then login with passkey', async ({ browser }) => {
	const context = await browser.newContext();
	const page = await context.newPage();

	// Enable virtual WebAuthn authenticator on this page's CDP session
	const cdp = await context.newCDPSession(page);
	await cdp.send('WebAuthn.enable', { enableUI: false });
	await cdp.send('WebAuthn.addVirtualAuthenticator', {
		options: {
			protocol: 'ctap2',
			transport: 'internal',
			hasResidentKey: true,
			hasUserVerification: true,
			isUserVerified: true
		}
	});

	// Register
	await page.goto(`${BASE_URL}/auth/login`);
	await page.getByRole('button', { name: 'Register a new passkey' }).click();
	await page.waitForURL(`${BASE_URL}/media`);

	// Logout
	await page.evaluate(() => fetch('/auth/logout', { method: 'POST', redirect: 'manual' }));
	await page.goto(`${BASE_URL}/auth/login`);
	await expect(page).toHaveURL(`${BASE_URL}/auth/login`);

	// Login with the same passkey
	await page.getByRole('button', { name: 'Sign in with passkey' }).click();
	await page.waitForURL(`${BASE_URL}/media`);

	await context.close();
});
