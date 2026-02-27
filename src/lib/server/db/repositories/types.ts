import type { File, Media, Settings, TagContent } from '../schema';
import type { Tag, TagWithStatus, TagFilter, NewTag, NewTagContent } from '$lib/logic/tag';
import type { MediaFilter } from '$lib/logic/media';
export type {
	File,
	Media,
	MediaFilter,
	Settings,
	Tag,
	TagWithStatus,
	TagFilter,
	NewTag,
	TagContent,
	NewTagContent
};
export type NewFile = File;
export type NewMedia = Omit<Media, 'id' | 'draftId' | 'dirty' | 'publishedAt' | 'updatedAt' | 'deletedAt'>;

export type Pagination = {
	limit?: number;
	orderBy?: string;
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

export type PublishedMedia = {
	name: string;
	slug: string;
	description: string | null;
};


export type PublishedTagWithMedia = {
	title: string | null;
	description: string | null;
	media: PaginatedResult<PublishedMedia>;
};

export type PublishedTag = {
	slug: string;
	title: string | null;
	description: string | null;
};

export interface MediaRepository {
	insert(data: NewMedia): Promise<string>;
	findById(id: string): Promise<Media | null>;
	findByIds(ids: string[]): Promise<Media[]>;
	findBySlug(slug: string): Promise<Media | null>;
	findFileBySlug(slug: string): Promise<File | null>;
	findAll(pagination: Pagination): Promise<PaginatedResult<Media>>;
	findCurrentIds(filter?: MediaFilter, pagination?: Pagination): Promise<string[]>;
	findAllIds(filter?: MediaFilter, pagination?: Pagination): Promise<PaginatedResult<string>>;
	filterIds(ids: string[], filter?: MediaFilter): Promise<string[]>;
	softDelete(id: string): Promise<void>;
	restore(id: string): Promise<void>;
	patch(id: string, data: Partial<Omit<Media, 'id' | 'fileHash'>>): Promise<void>;
	addTag(mediaIds: string[], tagId: string): Promise<void>;
	removeTag(mediaIds: string[], tagId: string): Promise<void>;
	getTags(mediaId: string): Promise<Tag[]>;
	getTagsForMany(mediaIds: string[]): Promise<Map<string, Tag[]>>;
	publish(ids: string[]): Promise<number>;
	hasPublished(ids: string[]): Promise<Map<string, boolean>>;
	findPublishedBySlug(slug: string): Promise<File | null>;
	findAllPublished(pagination?: Pagination): Promise<PaginatedResult<PublishedMedia>>;
	findPublishedMetaBySlug(slug: string): Promise<PublishedMedia | null>;
}

export interface TagRepository {
	create(input: NewTag): Promise<Tag>;
	findAll(filter?: TagFilter, pagination?: Pagination): Promise<PaginatedResult<Tag>>;
	findAllIds(filter?: TagFilter, pagination?: Pagination): Promise<PaginatedResult<string>>;
	findCurrentIds(filter?: TagFilter, pagination?: Pagination): Promise<string[]>;
	findWithStatusByIds(ids: string[]): Promise<TagWithStatus[]>;
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
	findPublishedMediaByTagSlug(
		slug: string,
		pagination?: Pagination
	): Promise<PublishedTagWithMedia | null>;
	findAllPublished(pagination?: Pagination): Promise<PaginatedResult<PublishedTag>>;
}

export interface SettingsRepository {
	get(): Promise<Settings>;
	patch(data: Partial<Omit<Settings, 'id'>>): Promise<void>;
}
