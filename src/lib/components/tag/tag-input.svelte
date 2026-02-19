<script lang="ts" module>
	import * as TagInput from '$lib/components/ui/tag-input/index.js';

	export type Item = ComponentProps<typeof TagInput.Item>;
</script>

<script lang="ts">
	import * as InputGroup from '$lib/components/ui/input-group';
	import { getTags, createTag } from './tags.remote';
	import { toast } from 'svelte-sonner';
	import type { ComponentProps } from 'svelte';

	type Item = ComponentProps<typeof TagInput.Item>;

	type Props = {
		label?: string;
		tags?: Item[];
		onselect?: (item: Item) => Promise<void>;
		onremove?: (item: Item) => Promise<void>;
	};

	let { label, tags = $bindable([]), onselect, onremove }: Props = $props();

	const initialTags = await getTags({ pagination: { limit: 50 } });
	let allTags = $state(initialTags.items);

	const handleSearch = async (search: string) => {
		const result = await getTags({
			filter: search ? { search } : undefined,
			pagination: { limit: 50 }
		});
		allTags = result.items;
		return allTags
			.filter((t) => !tags.some((tag) => tag.id === t.id))
			.map((t) => ({ id: t.id, label: t.name }));
	};

	const handleSelect = async (option: { id: string; label: string }) => {
		const item = { id: option.id, label: option.label };
		await onselect?.(item);
		tags = [...tags, item];
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
	{#if label}
		<InputGroup.Addon align="block-start">
			<InputGroup.Label>{label} ({tags.length})</InputGroup.Label>
			<TagInput.Options
				class="ms-auto"
				options={allTags
					.filter((t) => !tags.some((tag) => tag.id === t.id))
					.map((t) => ({ id: t.id, label: t.name }))}
				onadd={handleSelect}
				oncreate={handleCreate}
				onsearch={handleSearch}
			/>
		</InputGroup.Addon>
	{/if}
	<TagInput.List>
		{#each tags as tag (tag)}
			<TagInput.Item {...tag} onremove={handleRemove} />
		{/each}
	</TagInput.List>
</TagInput.Root>
