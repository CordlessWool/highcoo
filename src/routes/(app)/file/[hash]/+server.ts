import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import sharp from 'sharp';
import { storage } from '$lib/server/storage';
import { fileRepository } from '$lib/server/db/repositories';
import { WatermarkPosition } from '$lib/logic/settings';

const gravityMap: Record<WatermarkPosition, string> = {
	[WatermarkPosition.BottomRight]: 'southeast',
	[WatermarkPosition.BottomLeft]: 'southwest',
	[WatermarkPosition.TopRight]: 'northeast',
	[WatermarkPosition.TopLeft]: 'northwest',
	[WatermarkPosition.Center]: 'centre'
};

export const HEAD: RequestHandler = async ({ params }) => {
	const file = await fileRepository.findByHash(params.hash);
	if (!file) {
		throw error(404, 'File not found');
	}

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
	if (!file) {
		throw error(404, 'File not found');
	}

	const stream = await storage.get(file.path);
	if (!stream) {
		throw error(404, 'File not found in storage');
	}

	const width = url.searchParams.get('w');
	const wmHash = url.searchParams.get('wm');

	// No processing needed — serve raw file
	if (!width && !(wmHash?.trim() !== '')) {
		return new Response(stream, {
			headers: {
				'Content-Type': file.mimeType,
				'Content-Length': String(file.size),
				'Cache-Control': 'private, max-age=31536000'
			}
		});
	}

	const buffer = Buffer.from(await new Response(stream).arrayBuffer());
	const metadata = await sharp(buffer).metadata();
	let image = sharp(buffer).autoOrient();

	// Resize
	if (width) {
		const w = parseInt(width, 10);
		if (isNaN(w) || w <= 0 || w > 4096) {
			throw error(400, 'Invalid width');
		}
		image = image.resize(w, undefined, { withoutEnlargement: true });
	}

	// Watermark
	if (wmHash) {
		const wmFile = await fileRepository.findByHash(wmHash);
		if (wmFile) {
			const wmStream = await storage.get(wmFile.path);
			if (wmStream) {
				const wmBuffer = Buffer.from(await new Response(wmStream).arrayBuffer());
				const imageWidth = width
					? Math.min(parseInt(width, 10), metadata.width ?? 300)
					: (metadata.width ?? 300);
				const wmWidth = Math.round(imageWidth * 0.2);

				const opacity = parseFloat(url.searchParams.get('wm_opacity') ?? '0.5');
				const position = (url.searchParams.get('wm_pos') ??
					WatermarkPosition.BottomRight) as WatermarkPosition;

				// Resize watermark and apply opacity
				const resizedWm = sharp(wmBuffer)
					.resize(wmWidth, undefined, { withoutEnlargement: true })
					.ensureAlpha();

				const { data, info } = await resizedWm.raw().toBuffer({ resolveWithObject: true });

				if (opacity < 1) {
					for (let i = 3; i < data.length; i += 4) {
						data[i] = Math.round(data[i] * opacity);
					}
				}

				const watermark = await sharp(data, {
					raw: { width: info.width, height: info.height, channels: 4 }
				})
					.png()
					.toBuffer();

				image = image.composite([
					{
						input: watermark,
						gravity: gravityMap[position]
					}
				]);
			}
		}
	}

	const result = new Uint8Array(await image.webp().toBuffer());

	return new Response(result, {
		headers: {
			'Content-Type': 'image/webp',
			'Cache-Control': 'private, max-age=31536000'
		}
	});
};
