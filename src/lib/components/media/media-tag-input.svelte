<script lang="ts">
	import { Input as TagInput, type TagInputItem } from '$lib/components/tag';
	import { addTagToMedia, removeTagFromMedia, getTagsForMedia } from './media.remote';
	import { toast } from 'svelte-sonner';

	type Props = {
		label?: string;
		mediaIds: string[];
	};

	let { label, mediaIds }: Props = $props();

	// Compute common tags — reactive but no {#await} in template
	const tags = $derived(
		await (async (): Promise<TagInputItem[]> => {
			const [firstId, ...restIds] = mediaIds;
			const tagsOfFirst = await getTagsForMedia(firstId);
			if (restIds.length === 0) return tagsOfFirst.map((t) => ({ id: t.id, label: t.name }));
			const commonTags = await restIds.reduce(async (tags, id) => {
				const tagsOfCurrent = await getTagsForMedia(id);
				return (await tags).filter((tag) => tagsOfCurrent.some((t) => t.id === tag.id));
			}, Promise.resolve(tagsOfFirst));
			return commonTags.map((t) => ({ id: t.id, label: t.name }));
		})()
	);

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

<TagInput {label} {tags} onselect={handleSelect} onremove={handleRemove} />
