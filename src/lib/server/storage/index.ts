import type { StorageAdapter } from './types';
import { LocalStorageAdapter } from './local';
import { UPLOAD_PATH } from '$env/static/private';

const createStorage = (): StorageAdapter => {
	// TODO: read from config, support s3 later
	return new LocalStorageAdapter(UPLOAD_PATH || './uploads');
};

export const storage = createStorage();
