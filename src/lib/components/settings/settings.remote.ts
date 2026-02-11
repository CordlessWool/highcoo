import * as v from 'valibot';
import { extname } from 'path';
import { createSHA256 } from 'hash-wasm';
import { query, command, form } from '$app/server';
import { settingsRepository, fileRepository } from '$lib/server/db/repositories';
import { storage } from '$lib/server/storage';
import type { Settings } from '$lib/server/db/schema';
import { WatermarkPosition } from '$lib/logic/settings';

const PartialSettings = v.object({
	watermarkFileHash: v.optional(v.nullable(v.string())),
	watermarkPosition: v.optional(v.enum(WatermarkPosition)),
	watermarkOpacity: v.optional(v.number())
});

async function deleteWatermarkFile(hash: string) {
	const file = await fileRepository.findByHash(hash);
	if (file) {
		await storage.delete(file.path);
		await fileRepository.delete(hash);
	}
}

export const getSettings = query(async (): Promise<Settings> => {
	return settingsRepository.get();
});

export const patchSettings = command(PartialSettings, async (data) => {
	await settingsRepository.patch(data);
	const updated = await settingsRepository.get();
	getSettings().set(updated);
});

export const removeWatermark = command(async () => {
	const settings = await settingsRepository.get();
	if (settings.watermarkFileHash) {
		const hash = settings.watermarkFileHash;
		await settingsRepository.patch({ watermarkFileHash: null });
		await deleteWatermarkFile(hash);
	}
	await getSettings().refresh();
});

export const uploadWatermark = form(
	v.object({
		file: v.pipe(v.file(), v.mimeType(['image/png', 'image/webp', 'image/svg+xml']))
	}),
	async ({ file }) => {
		// Clear old watermark reference before deleting file
		const settings = await settingsRepository.get();
		const oldHash = settings.watermarkFileHash;
		if (oldHash) {
			await settingsRepository.patch({ watermarkFileHash: null });
			await deleteWatermarkFile(oldHash);
		}

		// Hash and store new file
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
		await getSettings().refresh();
	}
);
