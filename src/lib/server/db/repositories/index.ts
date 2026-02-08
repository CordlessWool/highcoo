import { db } from '../index';
import { createFileRepository } from './file';
import { createMediaRepository } from './media';
import { createTagRepository } from './tag';

export const fileRepository = createFileRepository(db);
export const mediaRepository = createMediaRepository(db);
export const tagRepository = createTagRepository(db);

export type { FileRepository, MediaRepository, TagRepository, NewFile, NewMedia } from './types';
export type { Tag, NewTag } from '$lib/logic/tag';
