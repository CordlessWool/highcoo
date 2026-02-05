import type { Media, MediaState } from './types';

export const mediaToState = (media: Media): MediaState => ({
	media,
	selected: false,
	deleted: false
});
