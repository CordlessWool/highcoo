import { getMediaIds } from '$lib/components/media/media.remote';
import { MEDIA_PAGE_LIMIT } from '$lib/logic/pagination';

export async function load() {
	const { items, pagination } = await getMediaIds({ pagination: { limit: MEDIA_PAGE_LIMIT } });
	return { init: { items, pagination } };
}
