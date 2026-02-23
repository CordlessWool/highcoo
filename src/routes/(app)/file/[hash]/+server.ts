import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { storage } from '$lib/server/storage';
import { fileRepository } from '$lib/server/db/repositories';
import { imagePipeline, validFormats, type ImageFormat } from '$lib/server/image';

export const HEAD: RequestHandler = async ({ params }) => {
	const file = await fileRepository.findByHash(params.hash);
	if (!file) throw error(404, 'File not found');

	return new Response(null, {
		headers: {
			'Content-Type': file.mimeType,
			'Content-Length': String(file.size),
			'Cache-Control': 'no-cache'
		}
	});
};

export const GET: RequestHandler = async ({ params, url }) => {
	const file = await fileRepository.findByHash(params.hash);
	if (!file) throw error(404, 'File not found');

	const stream = await storage.get(file.path);
	if (!stream) throw error(404, 'File not found in storage');

	const widthParam = url.searchParams.get('w');
	const wmHash = url.searchParams.get('wm');

	// No processing needed — serve raw file
	if (!widthParam && !wmHash) {
		return new Response(stream, {
			headers: {
				'Content-Type': file.mimeType,
				'Content-Length': String(file.size),
				'Cache-Control': 'private, max-age=31536000'
			}
		});
	}

	const width = widthParam ? parseInt(widthParam, 10) : undefined;
	if (width !== undefined && (isNaN(width) || width <= 0 || width > 4096)) {
		throw error(400, 'Invalid width');
	}

	const fmt = url.searchParams.get('fmt') ?? 'webp';
	if (!validFormats.includes(fmt as ImageFormat)) throw error(400, 'Invalid format');

	const buffer = Buffer.from(await new Response(stream).arrayBuffer());
	const pipeline = await imagePipeline(buffer)
		.format(fmt as ImageFormat)
		.resize(width)
		.loadWatermark(
			storage,
			fileRepository,
			wmHash,
			parseFloat(url.searchParams.get('wm_opacity') ?? '0.5'),
			url.searchParams.get('wm_pos') ?? ''
		);

	return new Response(new Uint8Array(await pipeline.toBuffer()), {
		headers: { 'Content-Type': pipeline.mimeType, 'Cache-Control': 'private, max-age=31536000' }
	});
};
