import type { File } from '$lib/server/db/schema';

export type Media = File;

export type MediaState = {
	media: Media;
	selected: boolean;
};

export type DeletedItem = {
	item: MediaState;
	index: number;
};
