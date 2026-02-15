<script lang="ts">
	import { resolve } from '$app/paths';
	import type { MediaState } from './types';

	type Props = {
		state: MediaState;
	};
	const { state: media, ...props }: Props = $props();

	let containerWidth = $state(0);

	// Round up to nearest 100 to improve cache hit rate
	const width = $derived(Math.ceil(containerWidth) * 2 || 600);
</script>

<div
	class="relative flex aspect-square items-center justify-center"
	bind:clientWidth={containerWidth}
>
	{#if containerWidth !== 0}
		<div class="relative">
			<img
				src="{resolve('/(app)/file/[hash]', { hash: media.media.fileHash })}?w={width}"
				alt={media.media.name}
				class="max-h-full max-w-full rounded-lg shadow-sm dark:shadow-none"
				class:ring-2={media.selected}
				class:ring-primary={media.selected}
				class:ring-offset-2={media.selected}
				class:ring-offset-background={media.selected}
			/>
			{#if media.media.dirty}
				<span
					class="absolute top-1.5 right-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-orange-500 dark:border-background"
					title="Unpublished changes"
				></span>
			{/if}
		</div>
	{/if}
</div>
