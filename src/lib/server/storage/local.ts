import { mkdir, readFile, unlink, access } from 'fs/promises';
import { createWriteStream } from 'fs';
import { Readable } from 'stream';
import { join } from 'path';
import type { StorageAdapter } from './types';

export class LocalStorageAdapter implements StorageAdapter {
	private basePath: string;

	constructor(basePath = './uploads') {
		this.basePath = basePath;
	}

	private getFilePath(hash: string): string {
		return join(this.basePath, hash);
	}

	async save(file: File, hash: string): Promise<string> {
		await mkdir(this.basePath, { recursive: true });
		const filePath = this.getFilePath(hash);
		console.log('save file');
		const writeStream = createWriteStream(filePath);
		const readable = Readable.fromWeb(file.stream());

		await new Promise((resolve, reject) => {
			readable.pipe(writeStream);
			writeStream.on('finish', resolve);
			writeStream.on('error', reject);
		});

		return filePath;
	}

	async get(hash: string): Promise<ReadableStream | null> {
		try {
			const buffer = await readFile(this.getFilePath(hash));
			return new ReadableStream({
				start(controller) {
					controller.enqueue(buffer);
					controller.close();
				}
			});
		} catch {
			return null;
		}
	}

	async delete(hash: string): Promise<void> {
		try {
			await unlink(this.getFilePath(hash));
		} catch {
			// file doesn't exist, ignore
		}
	}

	async exists(hash: string): Promise<boolean> {
		try {
			await access(this.getFilePath(hash));
			return true;
		} catch {
			return false;
		}
	}
}
