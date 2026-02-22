import sharp from 'sharp';
import { WatermarkPosition } from '$lib/logic/settings';
import type { StorageAdapter } from './storage/types';
import type { FileRepository } from './db/repositories/types';

export const validFormats = ['webp', 'jpeg', 'png', 'avif'] as const;
export type ImageFormat = (typeof validFormats)[number];

export const mimeTypes: Record<ImageFormat, string> = {
	webp: 'image/webp',
	jpeg: 'image/jpeg',
	png: 'image/png',
	avif: 'image/avif'
};

const gravityMap: Record<WatermarkPosition, string> = {
	[WatermarkPosition.BottomRight]: 'southeast',
	[WatermarkPosition.BottomLeft]: 'southwest',
	[WatermarkPosition.TopRight]: 'northeast',
	[WatermarkPosition.TopLeft]: 'northwest',
	[WatermarkPosition.Center]: 'centre'
};

export type WatermarkOptions = {
	buffer: Buffer;
	opacity: number;
	position: WatermarkPosition;
};

async function buildWatermark(opts: WatermarkOptions, imageWidth: number): Promise<Buffer> {
	const wmWidth = Math.round(imageWidth * 0.2);
	const resized = sharp(opts.buffer).resize(wmWidth, undefined, { withoutEnlargement: true }).ensureAlpha();
	const { data, info } = await resized.raw().toBuffer({ resolveWithObject: true });

	if (opts.opacity < 1) {
		for (let i = 3; i < data.length; i += 4) {
			data[i] = Math.round(data[i] * opts.opacity);
		}
	}

	return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
		.png()
		.toBuffer();
}

class ImagePipeline {
	private input: Buffer;
	private _width?: number;
	private _watermark?: WatermarkOptions;
	private _format?: ImageFormat;

	constructor(input: Buffer) {
		this.input = input;
	}

	resize(width: number | null | undefined): this {
		if (width != null) this._width = width;
		return this;
	}

	watermark(opts: WatermarkOptions | null | undefined): this {
		if (opts != null) this._watermark = opts;
		return this;
	}

	async loadWatermark(
		storage: StorageAdapter,
		fileRepository: FileRepository,
		hash: string | null | undefined,
		opacity: number,
		position: string
	): Promise<this> {
		if (!hash) return this;
		const wmFile = await fileRepository.findByHash(hash);
		const wmStream = wmFile ? await storage.get(wmFile.path) : null;
		if (wmStream) {
			this._watermark = {
				buffer: Buffer.from(await new Response(wmStream).arrayBuffer()),
				opacity,
				position: position as WatermarkPosition
			};
		}
		return this;
	}

	format(fmt: ImageFormat | null | undefined): this {
		if (fmt != null) this._format = fmt;
		return this;
	}

	getFormat(): ImageFormat {
		return this._format ?? 'webp';
	}

	async toBuffer(): Promise<Buffer> {
		let image = sharp(this.input).autoOrient();

		if (this._width) {
			image = image.resize(this._width, undefined, { withoutEnlargement: true });
		}

		if (this._watermark) {
			const metadata = await sharp(this.input).metadata();
			const imageWidth = this._width
				? Math.min(this._width, metadata.width ?? 300)
				: (metadata.width ?? 300);
			const wmInput = await buildWatermark(this._watermark, imageWidth);
			image = image.composite([{ input: wmInput, gravity: gravityMap[this._watermark.position] }]);
		}

		const fmt = this.getFormat();
		return (
			fmt === 'jpeg' ? image.jpeg() :
			fmt === 'png'  ? image.png()  :
			fmt === 'avif' ? image.avif() :
			                 image.webp()
		).toBuffer();
	}

	get mimeType(): string {
		return mimeTypes[this.getFormat()];
	}
}

export function imagePipeline(input: Buffer): ImagePipeline {
	return new ImagePipeline(input);
}
