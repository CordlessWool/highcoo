import { eq } from 'drizzle-orm';
import type { FileRepository, NewFile } from './types';
import type { db as database } from '../index';
import * as table from '../schema';

export const createFileRepository = (db: typeof database): FileRepository => ({
	async insert(data: NewFile): Promise<void> {
		await db.insert(table.file).values(data).onConflictDoNothing();
	},

	async findByHash(hash: string) {
		const [result] = await db.select().from(table.file).where(eq(table.file.hash, hash)).limit(1);
		return result ?? null;
	},

	async exists(hash: string): Promise<boolean> {
		const result = await this.findByHash(hash);
		return !!result;
	},

	async delete(hash: string): Promise<void> {
		await db.delete(table.file).where(eq(table.file.hash, hash));
	}
});
