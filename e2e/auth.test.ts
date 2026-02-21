import { expect, test } from '@playwright/test';
import { readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const APP_ROUTES_DIR = join(import.meta.dirname, '../src/routes/(app)');

function findPageRoutes(dir: string): string[] {
	const routes: string[] = [];
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) {
			routes.push(...findPageRoutes(full));
		} else if (entry === '+page.svelte') {
			const rel = relative(APP_ROUTES_DIR, dir);
			const route = rel === '' ? '/' : '/' + rel;
			if (!route.includes('[')) routes.push(route);
		}
	}
	return routes;
}

for (const route of findPageRoutes(APP_ROUTES_DIR)) {
	test(`${route} redirects to login when unauthenticated`, async ({ page }) => {
		await page.goto(route, { waitUntil: 'commit' });
		await expect(page).toHaveURL('/auth/login');
	});
}
