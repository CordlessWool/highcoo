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

	let { tags = [], options, onselect, oncreate, ...props }: Props = $props();

	let value = $state('');

	const handleInput = (event: KeyboardEvent) => {
		event.stopPropagation();
		if (event.key === 'Enter') {
			event.preventDefault();
			const input = event.target as HTMLInputElement;
			const inputValue = input.value.trim();
			if (inputValue) {
				if (value && value.some((p: string) => p === inputValue)) {
					toast.error('Value already exists');
					return;
				}
				tags = [...(tags ?? []), { id: '', label: inputValue }];
				input.value = '';
			}
		}
	};
</script>

<TagInput.Root>
	<TagInput.List>
		{#each tags as tag (tag)}
			<TagInput.Item {...tag} />
		{/each}
	</TagInput.List>
	<TagInput.Input onkeydown={handleInput} {...props} />
</TagInput.Root>
