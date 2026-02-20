import { db } from '../index';
import { createFileRepository } from './file';
import { createMediaRepository } from './media';
import { createTagRepository } from './tag';
import { createTagContentRepository } from './tag-content';
import { createSettingsRepository } from './settings';

export const fileRepository = createFileRepository(db);
export const mediaRepository = createMediaRepository(db);
export const tagRepository = createTagRepository(db);
export const tagContentRepository = createTagContentRepository(db);
export const settingsRepository = createSettingsRepository(db);

export type {
	FileRepository,
	MediaRepository,
	TagRepository,
	TagContentRepository,
	SettingsRepository,
	NewFile,
	NewMedia,
	PublishedMedia,
	PublishedTag,
	PublishedTagWithMedia
} from './types';
export type { Tag, NewTag, TagContent, NewTagContent } from '$lib/logic/tag';
