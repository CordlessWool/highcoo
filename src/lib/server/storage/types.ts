export interface StorageAdapter {
	save(file: File, hash: string): Promise<string>;
	get(hash: string): Promise<ReadableStream | null>;
	delete(hash: string): Promise<void>;
	exists(hash: string): Promise<boolean>;
}
