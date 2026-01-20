import type { File } from '../schema';
export type { File };
export type NewFile = Omit<File, 'createdAt'> & { createdAt?: Date };

export type Pagination = {
	limit: number;
	cursor?: string | null;
};

export type PaginatedResult<T> = {
	items: T[];
	pagination: Pagination;
};

export interface FileRepository {
	insert(data: NewFile): Promise<void>;
	findByHash(hash: string): Promise<File | null>;
	findBySlug(slug: string): Promise<File | null>;
	exists(hash: string): Promise<boolean>;
	findAll(pagination: Pagination): Promise<PaginatedResult<File>>;
}
