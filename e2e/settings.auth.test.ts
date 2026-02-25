import { test, expect } from '@playwright/test';
import sharp from 'sharp';

test.describe.configure({ mode: 'serial' });

test('watermark upload via settings page stores file and shows preview controls', async ({
	page
}) => {
	await page.goto('/settings');

	// Remove any existing watermark so we start from a clean slate
	const removeBtn = page.getByRole('button', { name: 'Remove' });
	if (await removeBtn.isVisible()) {
		await Promise.all([
			page.waitForResponse((r) => r.url().includes('/_app/') && r.status() === 200),
			removeBtn.click()
		]);
		// Wait for UI to reflect removal
		await expect(page.getByRole('button', { name: 'Add watermark' })).toBeVisible();
	}

	// No watermark: position/opacity controls must be hidden
	await expect(page.getByRole('combobox')).not.toBeVisible();
	await expect(page.getByRole('textbox')).not.toBeVisible();

	// Upload a solid green PNG as watermark
	const wmBuffer = await sharp({
		create: { width: 100, height: 100, channels: 4, background: { r: 0, g: 200, b: 0, alpha: 1 } }
	})
		.png()
		.toBuffer();

	const [fileChooser] = await Promise.all([
		page.waitForEvent('filechooser'),
		page.locator('input[type="file"]').evaluate((el) => (el as HTMLInputElement).click())
	]);
	await Promise.all([
		page.waitForResponse((r) => r.url().includes('/_app/') && r.status() === 200),
		fileChooser.setFiles({ name: 'watermark.png', mimeType: 'image/png', buffer: wmBuffer })
	]);

	// After upload: Replace/Remove buttons and position/opacity controls must appear
	await expect(page.getByRole('button', { name: 'Replace' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Remove' })).toBeVisible();
	await expect(page.getByRole('combobox')).toBeVisible(); // Position select
	await expect(page.getByRole('textbox')).toBeVisible(); // Opacity input

	// Clean up
	await Promise.all([
		page.waitForResponse((r) => r.url().includes('/_app/') && r.status() === 200),
		page.getByRole('button', { name: 'Remove' }).click()
	]);
	await expect(page.getByRole('button', { name: 'Add watermark' })).toBeVisible();
});

test('watermark opacity is persisted after save', async ({ page }) => {
	await page.goto('/settings');

	// Ensure clean state
	const removeBtn = page.getByRole('button', { name: 'Remove' });
	if (await removeBtn.isVisible()) {
		await Promise.all([
			page.waitForResponse((r) => r.url().includes('/_app/') && r.status() === 200),
			removeBtn.click()
		]);
		await expect(page.getByRole('button', { name: 'Add watermark' })).toBeVisible();
	}

	// Upload a watermark
	const wmBuffer = await sharp({
		create: { width: 100, height: 100, channels: 4, background: { r: 0, g: 0, b: 200, alpha: 1 } }
	})
		.png()
		.toBuffer();

	const [fileChooser] = await Promise.all([
		page.waitForEvent('filechooser'),
		page.locator('input[type="file"]').evaluate((el) => (el as HTMLInputElement).click())
	]);
	await Promise.all([
		page.waitForResponse((r) => r.url().includes('/_app/') && r.status() === 200),
		fileChooser.setFiles({ name: 'watermark.png', mimeType: 'image/png', buffer: wmBuffer })
	]);

	// Change opacity and wait for auto-save
	const opacityInput = page.getByRole('textbox');
	await opacityInput.fill('0.8');
	await Promise.all([
		page.waitForResponse((r) => r.url().includes('/_app/') && r.status() === 200),
		opacityInput.blur()
	]);

	// Reload and verify opacity persisted
	await page.reload();
	await expect(page.getByRole('textbox')).toHaveValue('0.8');

	// Clean up
	await Promise.all([
		page.waitForResponse((r) => r.url().includes('/_app/') && r.status() === 200),
		page.getByRole('button', { name: 'Remove' }).click()
	]);
});
