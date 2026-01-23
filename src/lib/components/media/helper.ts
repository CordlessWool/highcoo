import type { Photo, PhotoState } from './types';

export const photoToState = (photo: Photo): PhotoState => ({
	photo,
	selected: false
});
