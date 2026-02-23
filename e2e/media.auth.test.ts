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
	await page.waitForLoadState('networkidle');

	const before = await mediaCards(page).count();

	await uploadImage(page);

	await expect(mediaCards(page)).toHaveCount(before + 1, { timeout: 10000 });
});

test('publish media via select mode', async ({ page }) => {
	await page.goto(`${BASE_URL}/media`);
	await page.waitForLoadState('networkidle');

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
	await page.waitForLoadState('networkidle');

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

test('watermark is applied to /coo/ images when set', async ({ page, request }) => {
	// seed-image-1 is a 200×200 solid blue image — good contrast with a solid red watermark.
	// The watermark raises the red channel average, which we verify pixel-by-pixel.
	const slug = 'seed-image-1';

	// Extract the bottom-right 40×40 corner (where the watermark lands at southeast gravity)
	// and average the red channel there.
	async function avgRedCorner(buf: Buffer): Promise<number> {
		const img = sharp(buf);
		const { width = 200, height = 200 } = await img.metadata();
		const size = Math.min(40, width, height);
		const { data, info } = await img
			.extract({ left: width - size, top: height - size, width: size, height: size })
			.raw()
			.toBuffer({ resolveWithObject: true });
		const channels = info.channels;
		let sum = 0;
		for (let i = 0; i < data.length; i += channels) sum += data[i];
		return sum / (data.length / channels);
	}

	// Ensure no stale watermark from a previous run
	await page.goto(`${BASE_URL}/settings`);
	const removeBtn = page.getByRole('button', { name: 'Remove' });
	if (await removeBtn.isVisible()) {
		await Promise.all([
			page.waitForResponse((r) => r.url().includes('/_app/') && r.status() === 200),
			removeBtn.click()
		]);
	}

	// Baseline: fetch without watermark, both with and without resize
	const beforeWithWidth = await (await request.get(`${BASE_URL}/coo/${slug}/w/200`)).body();
	const beforeNoWidth = await (await request.get(`${BASE_URL}/coo/${slug}`)).body();
	const redBeforeWithWidth = await avgRedCorner(beforeWithWidth);
	const redBeforeNoWidth = await avgRedCorner(beforeNoWidth);

	// Upload a solid red PNG as watermark — maximally raises red channel vs blue source
	const wmBuffer = await sharp({
		create: { width: 200, height: 200, channels: 4, background: { r: 255, g: 0, b: 0, alpha: 1 } }
	})
		.png()
		.toBuffer();

	const [fileChooser] = await Promise.all([
		page.waitForEvent('filechooser'),
		page.locator('input[type="file"]').evaluate((el) => (el as HTMLInputElement).click())
	]);
	await Promise.all([
		page.waitForResponse((r) => r.url().includes('/_app/') && r.status() === 200),
		fileChooser.setFiles({ name: 'wm.png', mimeType: 'image/png', buffer: wmBuffer })
	]);

	// With resize: watermark must be applied
	const afterWithWidth = await request.get(`${BASE_URL}/coo/${slug}/w/200`);
	expect(afterWithWidth.ok()).toBe(true);
	expect(afterWithWidth.headers()['content-type']).toMatch(/^image\//);
	const redAfterWithWidth = await avgRedCorner(await afterWithWidth.body());
	expect(redAfterWithWidth).toBeGreaterThan(redBeforeWithWidth + 10);

	// Without resize: watermark must also be applied
	const afterNoWidth = await request.get(`${BASE_URL}/coo/${slug}`);
	expect(afterNoWidth.ok()).toBe(true);
	expect(afterNoWidth.headers()['content-type']).toMatch(/^image\//);
	const redAfterNoWidth = await avgRedCorner(await afterNoWidth.body());
	expect(redAfterNoWidth).toBeGreaterThan(redBeforeNoWidth + 10);

	// Clean up — remove watermark after test
	await Promise.all([
		page.waitForResponse((r) => r.url().includes('/_app/') && r.status() === 200),
		page.getByRole('button', { name: 'Remove' }).click()
	]);
});

test('drag to select range in select mode', async ({ page }) => {
	await page.goto(`${BASE_URL}/media`);
	await page.waitForLoadState('networkidle');

	// Ensure at least 3 images exist
	let count = await mediaCards(page).count();
	while (count < 3) {
		await uploadImage(page);
		count++;
		await expect(mediaCards(page)).toHaveCount(count, { timeout: 10000 });
	}

	await page.getByRole('button', { name: 'Select' }).click();

	// Drag from first card to third card
	const first = mediaCards(page).first();
	const third = mediaCards(page).nth(2);
	const firstBox = await first.boundingBox();
	const thirdBox = await third.boundingBox();

	await page.mouse.move(firstBox!.x + firstBox!.width / 2, firstBox!.y + firstBox!.height / 2);
	await page.mouse.down();
	await page.mouse.move(thirdBox!.x + thirdBox!.width / 2, thirdBox!.y + thirdBox!.height / 2, { steps: 10 });
	await page.mouse.up();

	await expect(page.getByText('3 selected')).toBeVisible();
});

test('drag back deselects items that left the range', async ({ page }) => {
	await page.goto(`${BASE_URL}/media`);
	await page.waitForLoadState('networkidle');

	// Ensure at least 3 images exist
	let count = await mediaCards(page).count();
	while (count < 3) {
		await uploadImage(page);
		count++;
		await expect(mediaCards(page)).toHaveCount(count, { timeout: 10000 });
	}

	await page.getByRole('button', { name: 'Select' }).click();

	const first = mediaCards(page).first();
	const second = mediaCards(page).nth(1);
	const third = mediaCards(page).nth(2);
	const firstBox = await first.boundingBox();
	const secondBox = await second.boundingBox();
	const thirdBox = await third.boundingBox();

	// Drag from first to third, then back to first (without releasing)
	await page.mouse.move(firstBox!.x + firstBox!.width / 2, firstBox!.y + firstBox!.height / 2);
	await page.mouse.down();
	await page.mouse.move(thirdBox!.x + thirdBox!.width / 2, thirdBox!.y + thirdBox!.height / 2, { steps: 10 });
	await page.mouse.move(firstBox!.x + firstBox!.width / 2, firstBox!.y + firstBox!.height / 2, { steps: 10 });
	await page.mouse.up();

	// Only the first card should remain selected
	await expect(page.getByText('1 selected')).toBeVisible();
});

test('drag back preserves previously selected items', async ({ page }) => {
	await page.goto(`${BASE_URL}/media`);
	await page.waitForLoadState('networkidle');

	// Ensure at least 4 images exist
	let count = await mediaCards(page).count();
	while (count < 4) {
		await uploadImage(page);
		count++;
		await expect(mediaCards(page)).toHaveCount(count, { timeout: 10000 });
	}

	await page.getByRole('button', { name: 'Select' }).click();

	// Pre-select the second card by clicking it
	await mediaCards(page).nth(1).click();
	await expect(page.getByText('1 selected')).toBeVisible();

	const third = mediaCards(page).nth(2);
	const fourth = mediaCards(page).nth(3);
	const thirdBox = await third.boundingBox();
	const fourthBox = await fourth.boundingBox();

	// Drag from third to fourth, then back to third
	// The pre-selected second card must NOT be affected
	await page.mouse.move(thirdBox!.x + thirdBox!.width / 2, thirdBox!.y + thirdBox!.height / 2);
	await page.mouse.down();
	await page.mouse.move(fourthBox!.x + fourthBox!.width / 2, fourthBox!.y + fourthBox!.height / 2, { steps: 10 });
	await page.mouse.move(thirdBox!.x + thirdBox!.width / 2, thirdBox!.y + thirdBox!.height / 2, { steps: 10 });
	await page.mouse.up();

	// Second (pre-selected) + third (drag start) = 2 selected
	await expect(page.getByText('2 selected')).toBeVisible();
});

test('restore deleted media via toast undo', async ({ page }) => {
	await page.goto(`${BASE_URL}/media`);
	await page.waitForLoadState('networkidle');

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

