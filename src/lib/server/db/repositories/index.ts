import { db } from '../index';
import { createFileRepository } from './file';
import { createTagRepository } from './tag';

export const fileRepository = createFileRepository(db);
export const tagRepository = createTagRepository(db);

export type { FileRepository, TagRepository, NewFile } from './types';
export type { Tag, NewTag } from '$lib/logic/tag';
