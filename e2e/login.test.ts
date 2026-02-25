import { test, expect } from '@playwright/test';

test('register then login with passkey', async ({ browser, baseURL }) => {
	const context = await browser.newContext({ baseURL });
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
	await page.goto('/auth/login');
	await page.getByRole('button', { name: 'Register a new passkey' }).click();
	await page.waitForURL('/media');

	// Logout
	await page.evaluate(() => fetch('/auth/logout', { method: 'POST', redirect: 'manual' }));
	await page.goto('/auth/login');
	await expect(page).toHaveURL('/auth/login');

	// Login with the same passkey
	await page.getByRole('button', { name: 'Sign in with passkey' }).click();
	await page.waitForURL('/media');

	await context.close();
});
