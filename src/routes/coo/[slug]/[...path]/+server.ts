import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { mediaRepository, fileRepository, settingsRepository } from '$lib/server/db/repositories';
import { storage } from '$lib/server/storage';
import { imagePipeline, validFormats, type ImageFormat } from '$lib/server/image';

type CooParams = {
	width: number | undefined;
	format: ImageFormat;
};

function parseCooPath(path: string): CooParams {
	let widthParam: string | undefined;
	let fmt = 'webp';
	if (path) {
		const segments = path.split('/');
		for (let i = 0; i < segments.length - 1; i += 2) {
			if (segments[i] === 'w') widthParam = segments[i + 1];
			if (segments[i] === 'f') fmt = segments[i + 1];
		}
	}
	if (!validFormats.includes(fmt as ImageFormat)) throw error(400, 'Invalid format');
	const width = widthParam ? parseInt(widthParam, 10) : undefined;
	if (width !== undefined && (isNaN(width) || width <= 0 || width > 4096)) throw error(400, 'Invalid width');
	return { width, format: fmt as ImageFormat };
}

export const GET: RequestHandler = async ({ params }) => {
	const { width, format } = parseCooPath(params.path ?? '');

	const [file, settings] = await Promise.all([
		mediaRepository.findPublishedBySlug(params.slug),
		settingsRepository.get()
	]);
	if (!file) throw error(404, 'Media not found');

	const stream = await storage.get(file.path);
	if (!stream) throw error(404, 'File not found in storage');

	const buffer = Buffer.from(await new Response(stream).arrayBuffer());
	const pipeline = await imagePipeline(buffer)
		.format(format)
		.resize(width)
		.loadWatermark(
			storage,
			fileRepository,
			settings.watermarkFileHash,
			settings.watermarkOpacity,
			settings.watermarkPosition
		);

	return new Response(await pipeline.toBuffer(), {
		headers: { 'Content-Type': pipeline.mimeType, 'Cache-Control': 'public, max-age=2592000' }
	});
};
