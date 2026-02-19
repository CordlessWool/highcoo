import { getMediaIds } from '$lib/components/media/media.remote';

const LIMIT = 24;

export async function load() {
	const { items, pagination } = await getMediaIds({ pagination: { limit: LIMIT } });
	return { init: { items, pagination } };
}
