import type { File } from '../schema';
import type { Tag, NewTag } from '$lib/logic/tag';
export type { File, Tag, NewTag };
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
	softDelete(hash: string): Promise<void>;
	restore(hash: string): Promise<void>;
	addTag(mediaHashes: string[], tagId: string): Promise<void>;
	removeTag(mediaHashes: string[], tagId: string): Promise<void>;
	getTags(mediaHash: string): Promise<Tag[]>;
	getTagsForMany(mediaHashes: string[]): Promise<Map<string, Tag[]>>;
}

export interface TagRepository {
	create(input: NewTag): Promise<Tag>;
	findAll(): Promise<Tag[]>;
	findById(id: string): Promise<Tag | null>;
	findBySlug(slug: string): Promise<Tag | null>;
	delete(id: string): Promise<void>;
}
