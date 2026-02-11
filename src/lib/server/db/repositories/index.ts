import { db } from '../index';
import { createFileRepository } from './file';
import { createMediaRepository } from './media';
import { createTagRepository } from './tag';
import { createSettingsRepository } from './settings';

export const fileRepository = createFileRepository(db);
export const mediaRepository = createMediaRepository(db);
export const tagRepository = createTagRepository(db);
export const settingsRepository = createSettingsRepository(db);

export type {
	FileRepository,
	MediaRepository,
	TagRepository,
	SettingsRepository,
	NewFile,
	NewMedia
} from './types';
export type { Tag, NewTag } from '$lib/logic/tag';
