import sharp from 'sharp';
import { WatermarkPosition } from '$lib/logic/settings';

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
	private _format: ImageFormat = 'webp';

	constructor(input: Buffer) {
		this.input = input;
	}

	resize(width: number): this {
		this._width = width;
		return this;
	}

	watermark(opts: WatermarkOptions): this {
		this._watermark = opts;
		return this;
	}

	format(fmt: ImageFormat): this {
		this._format = fmt;
		return this;
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

		return (
			this._format === 'jpeg' ? image.jpeg() :
			this._format === 'png'  ? image.png()  :
			this._format === 'avif' ? image.avif() :
			                          image.webp()
		).toBuffer();
	}
}

export function imagePipeline(input: Buffer): ImagePipeline {
	return new ImagePipeline(input);
}
