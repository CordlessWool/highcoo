<script lang="ts">
	import type { PhotoState } from './types';
	import type { Snippet } from 'svelte';

	type Props = {
		photos: PhotoState[];
		item: Snippet<[PhotoState]>;
	};

	let { photos = $bindable(), item }: Props = $props();

	let lastSelectedIndex = $state<number | null>(null);

	const handleClick = (index: number, event: MouseEvent) => {
		const photo = photos[index];

		if (event.shiftKey && lastSelectedIndex !== null) {
			// Range select
			const start = Math.min(lastSelectedIndex, index);
			const end = Math.max(lastSelectedIndex, index);

			for (let i = start; i <= end; i++) {
				photos[i].selected = true;
			}
		} else if (event.metaKey || event.ctrlKey) {
			// Toggle single item
			photo.selected = !photo.selected;
		} else {
			// Single select - clear others
			photos.forEach((i) => (i.selected = false));
			photo.selected = true;
		}

		lastSelectedIndex = index;
		photos = photos; // reassign to trigger reactivity
	};
</script>

<div class="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
	{#each photos as state, index (state.photo.hash)}
		<button type="button" class="cursor-pointer text-left" onclick={(e) => handleClick(index, e)}>
			{@render item(state)}
		</button>
	{/each}
</div>
