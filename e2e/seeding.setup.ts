import { test, expect, type Page } from '@playwright/test';
import path from 'path';

const FIXTURES = path.join(import.meta.dirname, 'fixtures');

const mediaCards = (page: Page) => page.locator('div.aspect-square button[type="button"]');

test('seed media and watermark', async ({ page }) => {
	await page.goto('/media');
	await page.waitForLoadState('networkidle');
	const before = await mediaCards(page).count();

	// Upload seed-image-1.png and seed-image-2.png via the media page file picker
	for (const filename of ['seed-image-1.png', 'seed-image-2.png']) {
		const [fc] = await Promise.all([
			page.waitForEvent('filechooser'),
			page
				.locator('div.ml-auto input[type="file"]')
				.evaluate((el) => (el as HTMLInputElement).click())
		]);
		await Promise.all([
			page.waitForResponse((r) => r.url().includes('/media/upload') && r.status() === 200),
			fc.setFiles(path.join(FIXTURES, filename))
		]);
	}
	await expect(mediaCards(page)).toHaveCount(before + 2, { timeout: 10000 });

	// Enter select mode, select the two newly uploaded cards, publish
	await page.getByRole('button', { name: 'Select' }).click();
	await mediaCards(page).nth(0).click();
	await mediaCards(page).nth(1).click();
	await Promise.all([
		page.waitForResponse((r) => r.url().includes('/_app/') && r.status() === 200),
		page.locator('div.ml-auto').getByRole('button', { name: 'Publish', exact: true }).click()
	]);

	// Upload watermark — intentionally left in place for unauthenticated /coo/ tests
	await page.goto('/settings');
	const removeBtn = page.getByRole('button', { name: 'Remove' });
	if (await removeBtn.isVisible()) {
		await Promise.all([
			page.waitForResponse((r) => r.url().includes('/_app/') && r.status() === 200),
			removeBtn.click()
		]);
	}
	const [fc] = await Promise.all([
		page.waitForEvent('filechooser'),
		page
			.locator('input[type="file"]')
			.evaluate((el) => (el as HTMLInputElement).click())
	]);
	await Promise.all([
		page.waitForResponse((r) => r.url().includes('/_app/') && r.status() === 200),
		fc.setFiles(path.join(FIXTURES, 'watermark.png'))
	]);
});
