import { test, expect } from '@playwright/test';
import path from 'path';

const FIXTURES = path.join(import.meta.dirname, 'fixtures');

// Re-upload the seeded watermark after authenticated tests may have removed it.
// Unauthenticated tests verify the watermark is applied to /coo/ images.
test('restore watermark for unauthenticated tests', async ({ page }) => {
	await page.goto('/settings');

	// Remove stale watermark if present
	const removeBtn = page.getByRole('button', { name: 'Remove' });
	if (await removeBtn.isVisible()) {
		await Promise.all([
			page.waitForResponse((r) => r.url().includes('/_app/') && r.status() === 200),
			removeBtn.click()
		]);
		await expect(page.getByRole('button', { name: 'Add watermark' })).toBeVisible();
	}

	// Upload fresh watermark
	const [fc] = await Promise.all([
		page.waitForEvent('filechooser'),
		page.locator('input[type="file"]').evaluate((el) => (el as HTMLInputElement).click())
	]);
	await Promise.all([
		page.waitForResponse((r) => r.url().includes('/_app/') && r.status() === 200),
		fc.setFiles(path.join(FIXTURES, 'watermark.png'))
	]);
});
