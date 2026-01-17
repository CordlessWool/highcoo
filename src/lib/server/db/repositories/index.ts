import { db } from '../index';
import { createFileRepository } from './file';

export const fileRepository = createFileRepository(db);

export type { FileRepository, NewFile } from './types';
