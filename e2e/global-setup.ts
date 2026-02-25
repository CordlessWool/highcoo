import { chromium } from '@playwright/test';
import { execSync } from 'child_process';
import postgres from 'postgres';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:4173';
const DB_URL =
	process.env.DATABASE_URL_TEST ?? 'postgresql://highcoo:highcoo@localhost:5432/highcoo_test';

async function resetDb() {
	execSync(`DATABASE_URL=${DB_URL} bun run db:migrate`, { stdio: 'inherit' });
	const sql = postgres(DB_URL);
	await sql`
		TRUNCATE "user", credential, session, file, media, tag, tag_content, media_tag, settings
		RESTART IDENTITY CASCADE
	`;
	await sql.end();
}

export default async function globalSetup() {
	await resetDb();

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

	// Register and log in
	await page.goto(`${BASE_URL}/auth/login`);
	await page.getByRole('button', { name: 'Register a new passkey' }).click();
	await page.waitForURL(`${BASE_URL}/media`);

	// Save session cookies for reuse in seeding and authenticated projects
	await context.storageState({ path: 'e2e/.auth.json' });

	await browser.close();
}
