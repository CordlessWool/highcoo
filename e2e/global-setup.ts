import { chromium } from '@playwright/test';
import { execSync } from 'child_process';
import { mkdirSync, rmSync, writeFileSync } from 'fs';
import { createHash } from 'crypto';
import postgres from 'postgres';
import sharp from 'sharp';

const BASE_URL = 'http://localhost:4173';
const DB_URL =
	process.env.DATABASE_URL_TEST ?? 'postgresql://highcoo:highcoo@localhost:5432/highcoo_test';

async function resetDb() {
	// Apply schema migrations (no-op if already up to date)
	execSync(`DATABASE_URL=${DB_URL} bun run db:migrate`, { stdio: 'inherit' });

	// Truncate all tables for a clean slate
	const sql = postgres(DB_URL);
	await sql`
		TRUNCATE "user", credential, session, file, media, tag, tag_content, media_tag, settings
		RESTART IDENTITY CASCADE
	`;
	await sql.end();

	// Clear test uploads folder
	rmSync('./uploads-test', { recursive: true, force: true });
}

// Seed two published media items with known slugs so unauthenticated pub/coo tests
// can reference them without needing to upload via the UI.
async function seedMedia(sql: postgres.Sql) {
	mkdirSync('./uploads-test', { recursive: true });

	for (const slug of ['seed-image-1', 'seed-image-2']) {
		const buf = await sharp({
			create: { width: 200, height: 200, channels: 3, background: { r: 100, g: 150, b: 200 } }
		})
			.png()
			.toBuffer();

		// Append slug to make the hash unique per seed item
		const hash = createHash('sha256').update(buf).update(slug).digest('hex');
		const path = `${hash}.png`;
		writeFileSync(`./uploads-test/${path}`, buf);

		const now = new Date();
		await sql`INSERT INTO file (hash, path, mime_type, size) VALUES (${hash}, ${path}, 'image/png', ${buf.length})`;
		await sql`
			INSERT INTO media (file_hash, name, slug, description, dirty, published_at, updated_at)
			VALUES (${hash}, ${slug}, ${slug}, NULL, false, ${now}, ${now})
		`;
	}

	// Seed a solid red watermark so the unauthenticated watermark test can verify
	// it is applied on /coo/ routes without needing to log in.
	const wmBuf = await sharp({
		create: { width: 200, height: 200, channels: 4, background: { r: 255, g: 0, b: 0, alpha: 1 } }
	})
		.png()
		.toBuffer();
	const wmHash = createHash('sha256').update(wmBuf).update('watermark').digest('hex');
	const wmPath = `${wmHash}.png`;
	writeFileSync(`./uploads-test/${wmPath}`, wmBuf);
	await sql`INSERT INTO file (hash, path, mime_type, size) VALUES (${wmHash}, ${wmPath}, 'image/png', ${wmBuf.length})`;
	await sql`INSERT INTO settings (id, watermark_file_hash, watermark_position, watermark_opacity) VALUES (1, ${wmHash}, 'bottom-right', 1)`;
}

export default async function globalSetup() {
	await resetDb();

	const sql = postgres(DB_URL);
	await seedMedia(sql);
	await sql.end();

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
