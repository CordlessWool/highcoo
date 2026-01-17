import type { File } from '../schema';

export type NewFile = Omit<File, 'createdAt'> & { createdAt?: Date };

export interface FileRepository {
	insert(data: NewFile): Promise<void>;
	findByHash(hash: string): Promise<File | null>;
	exists(hash: string): Promise<boolean>;
}
