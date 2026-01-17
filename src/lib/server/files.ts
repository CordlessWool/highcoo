import { extname } from 'path';
import type { StorageAdapter } from './storage/types';
import type { FileRepository } from './db/repositories/types';

type FileData = {
	file: File;
	hash: string;
};

type Services = {
	storage: StorageAdapter;
	fileRepository: FileRepository;
};

const generateSlug = (name: string): string => {
	return name
		.toLowerCase()
		.replace(/\.[^.]+$/, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
};

export const saveFile = async (fileData: FileData, services: Services) => {
	const { file, hash } = fileData;
	const { storage, fileRepository } = services;

	const ext = extname(file.name);
	const path = `${hash}${ext}`;

	await storage.save(file, path);

	const name = file.name;
	const slug = generateSlug(name);

	await fileRepository.insert({
		hash,
		name,
		slug,
		path,
		mimeType: file.type,
		size: file.size
	});

	return { hash, path, slug };
};

export const fileExists = async (hash: string, services: Services): Promise<boolean> => {
	return services.fileRepository.exists(hash);
};
