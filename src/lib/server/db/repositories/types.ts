import type { File, Media, Settings, TagContent } from '../schema';
import type { Tag, NewTag, NewTagContent } from '$lib/logic/tag';
export type { File, Media, Settings, Tag, NewTag, TagContent, NewTagContent };
export type NewFile = File;
export type NewMedia = Omit<Media, 'id' | 'dirty' | 'publishedAt' | 'updatedAt' | 'deletedAt'>;

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
	exists(hash: string): Promise<boolean>;
	delete(hash: string): Promise<void>;
}

export interface MediaRepository {
	insert(data: NewMedia): Promise<string>;
	findById(id: string): Promise<Media | null>;
	findBySlug(slug: string): Promise<Media | null>;
	findFileBySlug(slug: string): Promise<File | null>;
	findAll(pagination: Pagination): Promise<PaginatedResult<Media>>;
	softDelete(id: string): Promise<void>;
	restore(id: string): Promise<void>;
	patch(id: string, data: Partial<Omit<Media, 'id' | 'fileHash'>>): Promise<void>;
	addTag(mediaIds: string[], tagId: string): Promise<void>;
	removeTag(mediaIds: string[], tagId: string): Promise<void>;
	getTags(mediaId: string): Promise<Tag[]>;
	getTagsForMany(mediaIds: string[]): Promise<Map<string, Tag[]>>;
	publish(ids: string[]): Promise<number>;
	findPublishedBySlug(slug: string): Promise<File | null>;
}

export interface TagRepository {
	create(input: NewTag): Promise<Tag>;
	findAll(): Promise<Tag[]>;
	findById(id: string): Promise<Tag | null>;
	patch(id: string, data: Partial<Omit<Tag, 'id'>>): Promise<void>;
	delete(id: string): Promise<void>;
}

export interface TagContentRepository {
	create(input: NewTagContent): Promise<TagContent>;
	findByTagId(tagId: string): Promise<TagContent | null>;
	patch(
		id: string,
		data: Partial<Omit<TagContent, 'id' | 'tagId' | 'dirty' | 'publishedAt' | 'updatedAt'>>
	): Promise<void>;
	publish(tagId: string): Promise<void>;
	findPublishedBySlug(slug: string): Promise<TagContent | null>;
}

export interface SettingsRepository {
	get(): Promise<Settings>;
	patch(data: Partial<Omit<Settings, 'id'>>): Promise<void>;
}
