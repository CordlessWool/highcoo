import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:4173';

test('/pub/media returns valid shape', async ({ request }) => {
	const res = await request.get(`${BASE_URL}/pub/media`);
	expect(res.ok()).toBe(true);

	const body = await res.json();
	expect(Array.isArray(body.items)).toBe(true);
	expect(typeof body.pagination).toBe('object');

	// All returned items must have slug and image URLs
	for (const item of body.items) {
		expect(item.slug).toBeTruthy();
		expect(item.images.small).toMatch(/^\/coo\/.+\/w\/480$/);
	}
});

test('/pub/tags returns valid shape', async ({ request }) => {
	const res = await request.get(`${BASE_URL}/pub/tags`);
	expect(res.ok()).toBe(true);

	const body = await res.json();
	expect(Array.isArray(body.items)).toBe(true);
	expect(typeof body.pagination).toBe('object');
});
