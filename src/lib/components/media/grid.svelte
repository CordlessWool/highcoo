<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { MediaState } from './types';
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';

	type Props = {
		media: MediaState[];
		children: Snippet<[MediaState, (e: MouseEvent) => void]>;
	} & Omit<HTMLAttributes<HTMLDivElement>, 'children'>;

	let { media = $bindable(), children, ...props }: Props = $props();

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

<div {...props} class={cn('grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5', props.class)}>
	{#each media as state, index (state.media.id)}
		<div class="relative grid aspect-square content-center justify-center">
			{@render children(state, (e) => handleClick(index, e))}
		</div>
	{/each}
</div>
