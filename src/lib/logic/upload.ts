import { createSHA256 } from 'hash-wasm';
import * as v from 'valibot';
import { BatchProcessor } from './batch-processor';

export const FileUpload = v.object({
	file: v.pipe(v.file(), v.mimeType(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])),
	hash: v.pipe(v.string(), v.length(64))
});

export type FileUpload = v.InferOutput<typeof FileUpload>;

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

	await fetch('/api/files/upload', {
		method: 'POST',
		body: formData
	});
};

const checkAndUpload = async ({ file, hash }: { file: File; hash: string }): Promise<void> => {
	const exists = await fileExists(hash);
	if (exists) {
		// TODO: notify user of duplicate
		return;
	}
	await uploadFile(file, hash);
};

export const handleFiles = async (files: FileList | File[]) => {
	const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));

	const processor = new BatchProcessor(checkAndUpload, 3);

	for (const file of imageFiles) {
		const hash = await hashFile(file);
		processor.add({ file, hash });
	}
};
