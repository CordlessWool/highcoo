import { test, expect } from '@playwright/test';

// Uses its own isolated browser context with a throwaway passkey so the shared
// session in .auth.json is not invalidated for subsequent tests.
test('logout invalidates session and protected routes redirect to login', async ({ browser, baseURL }) => {
	const context = await browser.newContext({ baseURL });
	const page = await context.newPage();

	// Set up a virtual WebAuthn authenticator for this context
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

	// Register a fresh throwaway account
	await page.goto('/auth/login');
	await page.getByRole('button', { name: 'Register a new passkey' }).click();
	await page.waitForURL('/media');

	// Verify protected routes are accessible while authenticated
	await page.goto('/media');
	await expect(page).toHaveURL(/\/media/);

	// Logout
	await page.evaluate(() => fetch('/auth/logout', { method: 'POST', credentials: 'include' }));
	await page.reload();

	// Protected routes must now redirect to /auth/login
	await page.goto('/media');
	await expect(page).toHaveURL(/\/auth\/login/);

	await page.goto('/settings');
	await expect(page).toHaveURL(/\/auth\/login/);

	await page.goto('/tags');
	await expect(page).toHaveURL(/\/auth\/login/);

	await context.close();
});
