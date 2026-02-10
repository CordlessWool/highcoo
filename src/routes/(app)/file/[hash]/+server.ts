import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import sharp, { type FitEnum } from 'sharp';
import { storage } from '$lib/server/storage';
import { fileRepository } from '$lib/server/db/repositories';

export const HEAD: RequestHandler = async ({ params }) => {
	const file = await fileRepository.findByHash(params.hash);
	if (!file) {
		throw error(404, 'File not found');
	}

	return new Response(null, {
		headers: {
			'Content-Type': file.mimeType,
			'Content-Length': String(file.size)
		}
	});
};

export const GET: RequestHandler = async ({ params, url }) => {
	const file = await fileRepository.findByHash(params.hash);
	if (!file) {
		throw error(404, 'File not found');
	}

	const stream = await storage.get(file.path);
	if (!stream) {
		throw error(404, 'File not found in storage');
	}

	const width = url.searchParams.get('w');
	const fit = url.searchParams.get('fit');

	if (width) {
		const w = parseInt(width, 10);
		if (isNaN(w) || w <= 0 || w > 4096) {
			throw error(400, 'Invalid width');
		}

		const buffer = await new Response(stream).arrayBuffer();
		const resized = await sharp(Buffer.from(buffer))
			.resize(w, undefined, { withoutEnlargement: true, fit: fit ?? 'cover' })
			.autoOrient()
			.webp()
			.toBuffer();

		return new Response(resized, {
			headers: {
				'Content-Type': 'image/webp',
				'Cache-Control': 'private, max-age=31536000'
			}
		});
	}

	return new Response(stream, {
		headers: {
			'Content-Type': file.mimeType,
			'Content-Length': String(file.size),
			'Cache-Control': 'private, max-age=31536000'
		}
	});
};
