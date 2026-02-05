<script lang="ts" module>
	import * as TagInput from '$lib/components/ui/tag-input/index.js';

	export type Item = ComponentProps<typeof TagInput.Item>;
</script>

<script lang="ts">
	import { getTags, createTag } from './tags.remote';
	import { toast } from 'svelte-sonner';
	import type { ComponentProps } from 'svelte';

	type Item = ComponentProps<typeof TagInput.Item>;

	type Props = {
		tags?: Item[];
		onselect?: (item: Item) => Promise<void>;
		onremove?: (item: Item) => Promise<void>;
	};

	let { tags = $bindable([]), onselect, onremove }: Props = $props();
	console.log(tags);
	const allTags = getTags();

	// Filter out already-added tags
	const availableOptions = $derived(
		(allTags.current ?? [])
			.filter((t) => !tags.some((tag) => tag.label === t.name))
			.map((t) => t.name)
	);

	const handleSelect = async (label: string) => {
		const tag = (allTags.current ?? []).find((t) => t.name === label);
		if (tag) {
			const item = { id: tag.id, label: tag.name };
			await onselect?.(item);
			tags = [...tags, item];
		}
	};

	const handleCreate = async (label: string) => {
		if (tags.some((t) => t.label === label)) {
			toast.error('Tag already exists');
			return;
		}
		const tag = await createTag({ name: label });
		const item = { id: tag.id, label: tag.name };
		tags = [...tags, item];
	};

	const handleRemove = async (id: string) => {
		const item = tags.find((t) => t.id === id);
		if (item) {
			await onremove?.(item);
			tags = tags.filter((t) => t.id !== id);
		}
	};
</script>

<TagInput.Root>
	<TagInput.List>
		{#each tags as tag (tag)}
			<TagInput.Item {...tag} onremove={handleRemove} />
		{/each}
	</TagInput.List>
	<TagInput.Footer count={tags.length}>
		<TagInput.Options options={availableOptions} onadd={handleSelect} oncreate={handleCreate} />
	</TagInput.Footer>
</TagInput.Root>
