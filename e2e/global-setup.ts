import { chromium } from '@playwright/test';

const BASE_URL = 'http://localhost:4173';

export default async function globalSetup() {
	const browser = await chromium.launch();
	const context = await browser.newContext();
	const page = await context.newPage();

	// Enable virtual WebAuthn authenticator via CDP
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

	// Navigate to login page and click "Register a new passkey"
	await page.goto(`${BASE_URL}/auth/login`);
	await page.getByRole('button', { name: 'Register a new passkey' }).click();

	// Wait for redirect to /media after successful registration
	await page.waitForURL(`${BASE_URL}/media`);

	// Save session cookies for reuse in authenticated tests
	await context.storageState({ path: 'e2e/.auth.json' });

	await browser.close();
}
