import { getTagIds } from '$lib/components/tag/tags.remote';
import { TAG_PAGE_LIMIT } from '$lib/logic/pagination';

export async function load() {
	const { items, pagination } = await getTagIds({ pagination: { limit: TAG_PAGE_LIMIT } });
	return { init: { items, pagination } };
}
