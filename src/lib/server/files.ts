import { extname } from 'path';
import { nanoid } from 'nanoid';
import { generateSlug } from '$lib/logic/slug';
import type { StorageAdapter } from './storage/types';
import type { FileRepository, MediaRepository } from './db/repositories/types';

type FileData = {
	file: File;
	hash: string;
};

type Services = {
	storage: StorageAdapter;
	fileRepository: FileRepository;
	mediaRepository: MediaRepository;
};

export const saveFile = async (fileData: FileData, services: Services) => {
	const { file, hash } = fileData;
	const { storage, fileRepository, mediaRepository } = services;

	const ext = extname(file.name);
	const path = `${hash}${ext}`;

	await storage.save(file, path);

	await fileRepository.insert({
		hash,
		path,
		mimeType: file.type,
		size: file.size
	});

	const name = file.name;
	const slug = generateSlug(name);
	const id = nanoid();

	await mediaRepository.insert({
		id,
		fileHash: hash,
		name,
		slug,
		description: null
	});

	return { id, hash, path, slug };
};

export const fileExists = async (hash: string, services: Services): Promise<boolean> => {
	return services.fileRepository.exists(hash);
};
