import { test, expect } from '@playwright/test';
import sharp from 'sharp';

// Two published media items are seeded in global-setup.ts with these slugs
const SEED_SLUG_1 = 'seed-image-1';
const SEED_SLUG_2 = 'seed-image-2';

test('/pub/media returns valid shape', async ({ request }) => {
	const res = await request.get('/pub/media');
	expect(res.ok()).toBe(true);

	const body = await res.json();
	expect(Array.isArray(body.items)).toBe(true);
	expect(typeof body.pagination).toBe('object');

	// All returned items must have slug and all three image URLs
	for (const item of body.items) {
		expect(item.slug).toBeTruthy();
		expect(item.images.small).toMatch(/^\/coo\/.+\/w\/480$/);
		expect(item.images.medium).toMatch(/^\/coo\/.+\/w\/1080$/);
		expect(item.images.large).toMatch(/^\/coo\/.+\/w\/2048$/);
	}
});

test('/pub/media/[slug] returns correct shape for seeded item', async ({ request }) => {
	const res = await request.get(`/pub/media/${SEED_SLUG_1}`);
	expect(res.ok()).toBe(true);

	const body = await res.json();
	expect(body.slug).toBe(SEED_SLUG_1);
	expect(body.images.small).toBe(`/coo/${SEED_SLUG_1}/w/480`);
	expect(body.images.medium).toBe(`/coo/${SEED_SLUG_1}/w/1080`);
	expect(body.images.large).toBe(`/coo/${SEED_SLUG_1}/w/2048`);
});

test('/pub/media/[slug] returns 404 for unknown slug', async ({ request }) => {
	const res = await request.get('/pub/media/__nonexistent__');
	expect(res.status()).toBe(404);
});

test('/pub/media respects ?limit param', async ({ request }) => {
	const res = await request.get('/pub/media?limit=1');
	expect(res.ok()).toBe(true);

	const body = await res.json();
	expect(body.items.length).toBeLessThanOrEqual(1);
	expect(typeof body.pagination).toBe('object');
});

test('/pub/media pagination cursor advances to next page', async ({ request }) => {
	// Two seeded items guarantee at least 2 published items
	const first = await request.get('/pub/media?limit=1');
	expect(first.ok()).toBe(true);
	const firstBody = await first.json();
	expect(firstBody.items.length).toBe(1);

	const cursor = firstBody.pagination?.cursor;
	expect(cursor).toBeTruthy();

	const second = await request.get(`/pub/media?limit=1&cursor=${cursor}`);
	expect(second.ok()).toBe(true);
	const secondBody = await second.json();
	expect(secondBody.items.length).toBeGreaterThanOrEqual(1);
	expect(secondBody.items[0].slug).not.toBe(firstBody.items[0].slug);
});

test('/pub/tags returns valid shape', async ({ request }) => {
	const res = await request.get('/pub/tags');
	expect(res.ok()).toBe(true);

	const body = await res.json();
	expect(Array.isArray(body.items)).toBe(true);
	expect(typeof body.pagination).toBe('object');
});

test('/pub/tags respects ?limit param', async ({ request }) => {
	const res = await request.get('/pub/tags?limit=1');
	expect(res.ok()).toBe(true);

	const body = await res.json();
	expect(body.items.length).toBeLessThanOrEqual(1);
});

test('/pub/tags/[slug] returns 404 for unknown slug', async ({ request }) => {
	const res = await request.get('/pub/tags/__nonexistent__');
	expect(res.status()).toBe(404);
});

test('/coo/[slug]/w/480 serves image bytes for seeded media', async ({ request }) => {
	const res = await request.get(`/coo/${SEED_SLUG_1}/w/480`);
	expect(res.ok()).toBe(true);
	expect(res.headers()['content-type']).toMatch(/^image\//);
	const body = await res.body();
	expect(body.length).toBeGreaterThan(0);
});

test('/coo/[slug]/w/1080 serves image bytes for seeded media', async ({ request }) => {
	const res = await request.get(`/coo/${SEED_SLUG_2}/w/1080`);
	expect(res.ok()).toBe(true);
	expect(res.headers()['content-type']).toMatch(/^image\//);
	const body = await res.body();
	expect(body.length).toBeGreaterThan(0);
});

test('/coo/[slug]/w/480 returns 404 for unknown slug', async ({ request }) => {
	const res = await request.get('/coo/__nonexistent__/w/480');
	expect(res.status()).toBe(404);
});

test('/coo/[slug] applies seeded watermark without authentication', async ({ request }) => {
	async function avgRedCorner(buf: Buffer): Promise<number> {
		const img = sharp(buf);
		const { width = 200, height = 200 } = await img.metadata();
		const size = Math.min(40, width, height);
		const { data, info } = await img
			.extract({ left: width - size, top: height - size, width: size, height: size })
			.raw()
			.toBuffer({ resolveWithObject: true });
		let sum = 0;
		for (let i = 0; i < data.length; i += info.channels) sum += data[i];
		return sum / (data.length / info.channels);
	}

	// The seeded watermark is solid red at full opacity — the bottom-right corner of the
	// solid blue source image should have a red channel average well above ~100 (no watermark).
	const withWidth = await request.get(`/coo/${SEED_SLUG_1}/w/200`);
	expect(withWidth.ok()).toBe(true);
	expect(await avgRedCorner(await withWidth.body())).toBeGreaterThan(200);

	const noWidth = await request.get(`/coo/${SEED_SLUG_1}`);
	expect(noWidth.ok()).toBe(true);
	expect(await avgRedCorner(await noWidth.body())).toBeGreaterThan(200);
});

