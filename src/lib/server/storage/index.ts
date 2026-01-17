import type { StorageAdapter } from './types';
import { LocalStorageAdapter } from './local';

const createStorage = (): StorageAdapter => {
	// TODO: read from config, support s3 later
	return new LocalStorageAdapter();
};

export const storage = createStorage();
