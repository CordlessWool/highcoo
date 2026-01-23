import type { File } from '$lib/server/db/schema';

export type Photo = File;

export type PhotoState = {
	photo: Photo;
	selected: boolean;
};

export type DeletedItem = {
	item: PhotoState;
	index: number;
};
