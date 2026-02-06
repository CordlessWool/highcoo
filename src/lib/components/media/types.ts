import type * as table from '$lib/server/db/schema';

export type Media = table.Media;

export type MediaState = {
	media: Media;
	selected: boolean;
	deleted: boolean;
};
