<script lang="ts">
	import { Input as TagInput, type TagInputItem } from '$lib/components/tag';
	import { addTagToMedia, removeTagFromMedia, getTagsForMedia } from './media.remote';
	import { toast } from 'svelte-sonner';

	type Props = {
		hashes: string[];
	};

	let { hashes }: Props = $props();

	// Compute common tags (tags that ALL selected media have)
	const tags = $derived.by(async (): Promise<TagInputItem[]> => {
		const [firstHash, ...restHashes] = hashes;
		const tagsOfFirst = await getTagsForMedia(firstHash);
		console.log(tagsOfFirst);

		if (restHashes.length === 0) return tagsOfFirst.map((t) => ({ id: t.id, label: t.name }));
		const commonTags = await restHashes.reduce(async (tags, hash) => {
			const tagsOfCurrent = await getTagsForMedia(hash);
			return (await tags).filter((tag) => tagsOfCurrent.some((t) => t.id === tag.id));
		}, Promise.resolve(tagsOfFirst));
		return commonTags.map((t) => ({ id: t.id, label: t.name }));
	});

	const handleSelect = async (item: Item) => {
		try {
			await addTagToMedia({ tagId: item.id, hashes });
		} catch {
			toast.error('Failed to add tag');
		}
	};

	const handleRemove = async (item: Item) => {
		try {
			await removeTagFromMedia({ tagId: item.id, hashes });
		} catch {
			toast.error('Failed to remove tag');
		}
	};
</script>

{#await tags then tags}
	<TagInput {tags} onselect={handleSelect} onremove={handleRemove} />
{/await}
