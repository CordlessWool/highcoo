import { createSHA256 } from 'hash-wasm';
import * as v from 'valibot';
import { toast } from 'svelte-sonner';
import { BatchProcessor } from './batch-processor';
import type { UploadContext } from '$lib/components/load/upload-context.svelte';

export const FileUpload = v.object({
	file: v.pipe(v.file(), v.mimeType(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])),
	hash: v.pipe(v.string(), v.length(64))
});

export type FileUpload = v.InferOutput<typeof FileUpload>;

type UploadItem = { file: File; hash: string };

export enum UPLOAD_STATUS {
	UPLOADED = 'UPLOADED',
	DUPLICATE = 'DUPLICATE'
}

const hashFile = async (file: File): Promise<string> => {
	const hasher = await createSHA256();
	const reader = file.stream().getReader();

	let chunk = await reader.read();
	while (!chunk.done) {
		hasher.update(chunk.value);
		chunk = await reader.read();
	}

	return hasher.digest('hex');
};

const fileExists = async (hash: string): Promise<boolean> => {
	const res = await fetch(`/api/files/${hash}/exists`);
	const data = await res.json();
	return data.exists;
};

const uploadFile = async (file: File, hash: string): Promise<void> => {
	const formData = new FormData();
	formData.append('file', file);
	formData.append('hash', hash);

	const res = await fetch('/api/files/upload', {
		method: 'POST',
		body: formData
	});

	if (!res.ok) {
		throw new Error(`Upload failed: ${res.statusText}`);
	}
};

const checkAndUpload = async ({ file, hash }: UploadItem): Promise<UPLOAD_STATUS> => {
	const exists = await fileExists(hash);
	if (exists) {
		return UPLOAD_STATUS.DUPLICATE;
	}
	await uploadFile(file, hash);
	return UPLOAD_STATUS.UPLOADED;
};

export const uploadFiles = async (files: FileList | File[], ctx: UploadContext): Promise<void> => {
	const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));

	const processor = new BatchProcessor(checkAndUpload, 3);

	processor.subscribe((result) => {
		if (result.ok === true) {
			ctx.complete();
			if (result.value === UPLOAD_STATUS.DUPLICATE) {
				toast.warning(`File ${result.item.file.name} already exists`);
			}
		} else {
			ctx.fail();
			toast.error(`Failed to upload ${result.item.file.name}`, {
				action: {
					label: 'Retry',
					onClick: () => {
						ctx.retry();
						processor.add(result.item);
					}
				},
				onDismiss: () => {
					ctx.dismissError();
				}
			});
		}
	});

	ctx.start(imageFiles.length);

	for (const file of imageFiles) {
		const hash = await hashFile(file);
		processor.add({ file, hash });
	}
};
