import { test, expect, type Page } from '@playwright/test';
import sharp from 'sharp';

// Run serially — tests share the same user/DB and upload counts would race in parallel
test.describe.configure({ mode: 'serial' });

const BASE_URL = 'http://localhost:4173';

// Generate a unique PNG per call so the SHA-256 hash is always new (avoids DUPLICATE path)
async function tinyPngBuffer(): Promise<Buffer> {
	const r = Math.floor(Math.random() * 256);
	const g = Math.floor(Math.random() * 256);
	const b = Math.floor(Math.random() * 256);
	return sharp({ create: { width: 8, height: 8, channels: 3, background: { r, g, b } } })
		.png()
		.toBuffer();
}

// Media cards are buttons inside aspect-square grid cells
const mediaCards = (page: Page) => page.locator('div.aspect-square button[type="button"]');

// Toolbar action buttons (scoped to the ml-auto container to avoid matching card buttons)
const toolbarButton = (page: Page, name: string) =>
	page.locator('div.ml-auto').getByRole('button', { name, exact: true });

async function uploadImage(page: Page): Promise<void> {
	const buffer = await tinyPngBuffer();
	const [fileChooser] = await Promise.all([
		page.waitForEvent('filechooser'),
		page.locator('div.ml-auto input[type="file"]').evaluate((el) => (el as HTMLInputElement).click())
	]);
	await Promise.all([
		page.waitForResponse((r) => r.url().includes('/media/upload') && r.status() === 200),
		fileChooser.setFiles({ name: 'test.png', mimeType: 'image/png', buffer })
	]);
}

test('upload image appears in grid', async ({ page }) => {
	await page.goto(`${BASE_URL}/media`);

	const before = await mediaCards(page).count();

	await uploadImage(page);

	await expect(mediaCards(page)).toHaveCount(before + 1, { timeout: 10000 });
});

test('publish media via select mode', async ({ page }) => {
	await page.goto(`${BASE_URL}/media`);

	const before = await mediaCards(page).count();

	await uploadImage(page);
	await expect(mediaCards(page)).toHaveCount(before + 1, { timeout: 10000 });

	// Enter select mode and select the newly uploaded (first) card
	await page.getByRole('button', { name: 'Select' }).click();
	await mediaCards(page).first().click();
	await expect(page.getByText('1 selected')).toBeVisible();

	// Publish — wait for the remote command to complete
	await Promise.all([
		page.waitForResponse((r) => r.url().includes('/_app/') && r.status() === 200),
		toolbarButton(page, 'Publish').click()
	]);

	// Item should now appear in the public API
	const res = await page.evaluate(() => fetch('/pub/media').then((r) => r.json()));
	expect(res.items.length).toBeGreaterThan(0);
});

test('delete media via select mode', async ({ page }) => {
	await page.goto(`${BASE_URL}/media`);

	const before = await mediaCards(page).count();

	await uploadImage(page);
	await expect(mediaCards(page)).toHaveCount(before + 1, { timeout: 10000 });

	// Enter select mode and select the first card
	await page.getByRole('button', { name: 'Select' }).click();
	await mediaCards(page).first().click();
	await expect(page.getByText('1 selected')).toBeVisible();

	// Delete
	await toolbarButton(page, 'Delete').click();

	await expect(mediaCards(page)).toHaveCount(before, { timeout: 5000 });
});

test('restore deleted media via toast undo', async ({ page }) => {
	await page.goto(`${BASE_URL}/media`);

	const before = await mediaCards(page).count();

	await uploadImage(page);
	await expect(mediaCards(page)).toHaveCount(before + 1, { timeout: 10000 });

	// Select and delete
	await page.getByRole('button', { name: 'Select' }).click();
	await mediaCards(page).first().click();
	await toolbarButton(page, 'Delete').click();
	await expect(mediaCards(page)).toHaveCount(before, { timeout: 5000 });

	// Undo via toast
	await page.getByRole('button', { name: 'Undo' }).click();

	await expect(mediaCards(page)).toHaveCount(before + 1, { timeout: 5000 });
});

test('/coo/[slug]/w/480 serves image for published media', async ({ page }) => {
	await page.goto(`${BASE_URL}/media`);

	const res = await page.evaluate(() => fetch('/pub/media').then((r) => r.json()));

	if (res.items.length === 0) {
		test.skip();
		return;
	}

	const slug = res.items[0].slug;
	const response = await page.evaluate(
		(s) =>
			fetch(`/coo/${s}/w/480`).then((r) => ({
				status: r.status,
				type: r.headers.get('content-type')
			})),
		slug
	);

	expect(response.status).toBe(200);
	expect(response.type).toMatch(/^image\//);
});
