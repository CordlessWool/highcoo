<script lang="ts">
	import * as TagInput from '$lib/components/ui/tag-input/index.js';
	import { toast } from 'svelte-sonner';
	import type { ComponentProps } from 'svelte';

	type Item = ComponentProps<typeof TagInput.Item>;

	type Props = {
		tags?: Item[];
		options?: Item[];
		onselect?: (item: Item) => Promise<void>;
		oncreate?: (item: Item) => Promise<void>;
		onremove?: (item: Item) => Promise<void>;
	};

	let { tags = [], options = [], onselect, oncreate, onremove }: Props = $props();

	// Filter out already-added tags
	const availableOptions = $derived(
		options.filter((o) => !tags.some((t) => t.label === o.label)).map((o) => o.label)
	);

	const handleSelect = async (label: string) => {
		const item = options.find((o) => o.label === label);
		if (item) {
			await onselect?.(item);
			tags = [...tags, item];
		}
	};

	const handleCreate = async (label: string) => {
		if (tags.some((t) => t.label === label)) {
			toast.error('Tag already exists');
			return;
		}
		const item = { id: '', label };
		await oncreate?.(item);
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
