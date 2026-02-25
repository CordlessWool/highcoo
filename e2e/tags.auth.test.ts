import { test, expect } from '@playwright/test';

test('create tag appears in list', async ({ page }) => {
	await page.goto('/tags');

	const tagName = `Tag-${Date.now()}`;

	await page.getByRole('button', { name: 'Create Tag' }).click();
	await page.getByPlaceholder('Name').fill(tagName);
	await page.getByRole('button', { name: 'Create', exact: true }).click();

	// The newly created tag card should appear
	await expect(page.getByText(tagName).first()).toBeVisible({ timeout: 5000 });
});
