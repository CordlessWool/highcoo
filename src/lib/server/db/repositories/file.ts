import { eq } from 'drizzle-orm';
import type { FileRepository, NewFile } from './types';
import type { db as database } from '../index';
import { file } from '../schema';

export const createFileRepository = (db: typeof database): FileRepository => ({
	async insert(data: NewFile): Promise<void> {
		await db.insert(file).values({
			...data,
			createdAt: data.createdAt ?? new Date()
		});
	},

	async findByHash(hash: string) {
		const result = await db.query.file.findFirst({
			where: eq(file.hash, hash)
		});
		return result ?? null;
	},

	async exists(hash: string): Promise<boolean> {
		const result = await this.findByHash(hash);
		return !!result;
	}
});
