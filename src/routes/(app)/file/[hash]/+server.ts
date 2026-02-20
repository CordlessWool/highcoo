import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { storage } from '$lib/server/storage';
import { fileRepository } from '$lib/server/db/repositories';
import { WatermarkPosition } from '$lib/logic/settings';
import { imagePipeline, validFormats, mimeTypes, type ImageFormat } from '$lib/server/image';

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

	// Validate width
	const width = widthParam ? parseInt(widthParam, 10) : undefined;
	if (width !== undefined && (isNaN(width) || width <= 0 || width > 4096)) {
		throw error(400, 'Invalid width');
	}

	// Validate format
	const fmtParam = url.searchParams.get('fmt') ?? 'webp';
	if (!validFormats.includes(fmtParam as ImageFormat)) throw error(400, 'Invalid format');

	// Build pipeline
	const buffer = Buffer.from(await new Response(stream).arrayBuffer());
	const pipeline = imagePipeline(buffer).format(fmtParam as ImageFormat);

	if (width) pipeline.resize(width);

	if (wmHash) {
		const wmFile = await fileRepository.findByHash(wmHash);
		const wmStream = wmFile ? await storage.get(wmFile.path) : null;
		if (wmStream) {
			pipeline.watermark({
				buffer: Buffer.from(await new Response(wmStream).arrayBuffer()),
				opacity: parseFloat(url.searchParams.get('wm_opacity') ?? '0.5'),
				position: (url.searchParams.get('wm_pos') ?? WatermarkPosition.BottomRight) as WatermarkPosition
			});
		}
	}

	const result = await pipeline.toBuffer();

	return new Response(result, {
		headers: {
			'Content-Type': mimeTypes[fmtParam as ImageFormat],
			'Cache-Control': 'private, max-age=31536000'
		}
	});
};
