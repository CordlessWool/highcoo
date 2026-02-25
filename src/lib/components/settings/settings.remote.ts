import * as v from 'valibot';
import { extname } from 'path';
import { createSHA256 } from 'hash-wasm';
import { query, command, form } from '$app/server';
import { settingsRepository, fileRepository } from '$lib/server/db/repositories';
import { storage } from '$lib/server/storage';
import { deleteFile } from '$lib/server/files';
import type { Settings } from '$lib/server/db/schema';
import { WatermarkPosition } from '$lib/logic/settings';

const PartialSettings = v.object({
	watermarkFileHash: v.optional(v.nullable(v.string())),
	watermarkPosition: v.optional(v.enum(WatermarkPosition)),
	watermarkOpacity: v.optional(v.number())
});

export const getSettings = query(async (): Promise<Settings> => {
	return settingsRepository.get();
});

export const patchSettings = command(PartialSettings, async (data) => {
	await settingsRepository.patch(data);
	const updated = await settingsRepository.get();
	getSettings().set(updated);
});

async function clearWatermark() {
	const settings = await settingsRepository.get();
	if (settings.watermarkFileHash) {
		await settingsRepository.patch({ watermarkFileHash: null });
		await deleteFile(settings.watermarkFileHash, { storage, fileRepository });
	}
}

export const removeWatermark = command(async () => {
	await clearWatermark();
	const updated = await settingsRepository.get();
	getSettings().set(updated);
});

const ALLOWED_WATERMARK_TYPES = ['image/png', 'image/webp', 'image/svg+xml'];

const filelike = v.custom<File>(
	(v) =>
		v !== null &&
		typeof v === 'object' &&
		typeof (v as File).name === 'string' &&
		typeof (v as File).type === 'string' &&
		typeof (v as File).size === 'number' &&
		typeof (v as File).arrayBuffer === 'function',
	'Expected File'
);

export const uploadWatermark = form(
	v.object({
		watermark: v.pipe(
			filelike,
			v.check((f) => ALLOWED_WATERMARK_TYPES.includes(f.type), 'Invalid file type')
		)
	}),
	async ({ watermark: file }) => {
		await clearWatermark();

		const buffer = await file.arrayBuffer();
		const hasher = await createSHA256();
		hasher.update(new Uint8Array(buffer));
		const hash = hasher.digest('hex');

		const exists = await fileRepository.exists(hash);
		if (!exists) {
			const ext = extname(file.name);
			const path = `${hash}${ext}`;
			await storage.save(file, path);
			await fileRepository.insert({ hash, path, mimeType: file.type, size: file.size });
		}

		await settingsRepository.patch({ watermarkFileHash: hash });
		const updated = await settingsRepository.get();
		getSettings().set(updated);
	}
);
