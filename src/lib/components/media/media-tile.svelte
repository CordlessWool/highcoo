<script lang="ts">
	import { resolve } from '$app/paths';
	import type { MediaState } from './types';

	type Props = {
		state: MediaState;
	};
	const { state: media }: Props = $props();

	let containerWidth = $state(0);

	// Round up to nearest 100 to improve cache hit rate
	const width = $derived(Math.ceil(containerWidth) * 2 || 600);
</script>

<div class="flex aspect-square items-center justify-center" bind:clientWidth={containerWidth}>
	{#if containerWidth !== 0}
		<img
			src="{resolve('/(app)/file/[hash]', { hash: media.media.fileHash })}?w={width}"
			alt={media.media.name}
			class="max-h-full max-w-full rounded-lg"
			class:ring-2={media.selected}
			class:ring-primary={media.selected}
			class:ring-offset-2={media.selected}
		/>
	{/if}
</div>
