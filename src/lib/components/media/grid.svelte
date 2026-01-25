<script lang="ts">
	import type { MediaState } from './types';
	import type { Snippet } from 'svelte';

	type Props = {
		media: MediaState[];
		children: Snippet<[MediaState]>;
	};

	let { media = $bindable(), children }: Props = $props();

	let lastSelectedIndex = $state<number | null>(null);

	const handleClick = (index: number, event: MouseEvent) => {
		const item = media[index];

		if (event.shiftKey && lastSelectedIndex !== null) {
			// Range select
			const start = Math.min(lastSelectedIndex, index);
			const end = Math.max(lastSelectedIndex, index);

			for (let i = start; i <= end; i++) {
				media[i].selected = true;
			}
		} else if (event.metaKey || event.ctrlKey) {
			// Toggle single item
			item.selected = !item.selected;
		} else {
			// Single select - clear others
			media.forEach((i) => (i.selected = false));
			item.selected = true;
		}

		lastSelectedIndex = index;
		media = media; // reassign to trigger reactivity
	};
</script>

<div class="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
	{#each media as state, index (state.media.hash)}
		<button type="button" class="cursor-pointer text-left" onclick={(e) => handleClick(index, e)}>
			{@render children(state)}
		</button>
	{/each}
</div>
