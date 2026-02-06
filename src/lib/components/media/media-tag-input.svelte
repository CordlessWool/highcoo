<script lang="ts">
	import { Input as TagInput, type TagInputItem } from '$lib/components/tag';
	import { addTagToMedia, removeTagFromMedia, getTagsForMedia } from './media.remote';
	import { toast } from 'svelte-sonner';

	type Props = {
		mediaIds: string[];
	};

	let { mediaIds }: Props = $props();

	// Compute common tags (tags that ALL selected media have)
	const tags = $derived.by(async (): Promise<TagInputItem[]> => {
		const [firstId, ...restIds] = mediaIds;
		const tagsOfFirst = await getTagsForMedia(firstId);

		if (restIds.length === 0) return tagsOfFirst.map((t) => ({ id: t.id, label: t.name }));
		const commonTags = await restIds.reduce(async (tags, id) => {
			const tagsOfCurrent = await getTagsForMedia(id);
			return (await tags).filter((tag) => tagsOfCurrent.some((t) => t.id === tag.id));
		}, Promise.resolve(tagsOfFirst));
		return commonTags.map((t) => ({ id: t.id, label: t.name }));
	});

	const handleSelect = async (item: TagInputItem) => {
		try {
			await addTagToMedia({ tagId: item.id, mediaIds });
		} catch {
			toast.error('Failed to add tag');
		}
	};

	const handleRemove = async (item: TagInputItem) => {
		try {
			await removeTagFromMedia({ tagId: item.id, mediaIds });
		} catch {
			toast.error('Failed to remove tag');
		}
	};
</script>

{#await tags then tags}
	<TagInput {tags} onselect={handleSelect} onremove={handleRemove} />
{/await}
