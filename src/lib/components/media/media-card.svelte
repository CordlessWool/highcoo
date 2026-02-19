<script lang="ts">
	import { resolve } from '$app/paths';
	import { getMedia } from './media.remote';
	import { ImageOff } from '@lucide/svelte';
	import { Skeleton } from '$lib/components/ui/skeleton';

	type Props = {
		id: string;
		isSelected: boolean;
		onclick: (e: MouseEvent) => void;
	};
	const { id, isSelected, onclick }: Props = $props();

	// Deterministic pseudo-random from id — stable across renders
	const isLandscape = id.charCodeAt(0) + id.charCodeAt(id.length - 1) + id.charCodeAt(4) > 200;
</script>

<div class="relative grid aspect-square content-center justify-center">
	<svelte:boundary>
		{@const media = await getMedia(id)}
		<button
			type="button"
			class="relative block h-full w-full overflow-hidden rounded-lg shadow-sm dark:shadow-none"
			class:ring-2={isSelected}
			class:ring-primary={isSelected}
			class:ring-offset-2={isSelected}
			class:ring-offset-background={isSelected}
			{onclick}
		>
			<Skeleton class="absolute inset-0 h-full w-full rounded-lg" />
			<img
				src="{resolve('/(app)/file/[hash]', { hash: media.fileHash })}?w=600"
				class="relative h-full w-full rounded-lg object-cover"
				alt={media.name}
			/>
			{#if media.dirty}
				<span
					class="absolute top-1.5 right-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-orange-500 dark:border-background"
					title="Unpublished changes"
				></span>
			{/if}
		</button>

		{#snippet pending()}
			<Skeleton
				class={isLandscape ? 'h-full w-full rounded-lg' : 'mx-auto h-full w-3/4 rounded-lg'}
			/>
		{/snippet}

		{#snippet failed(_error, reset)}
			<button
				type="button"
				class="relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg bg-muted text-muted-foreground"
				onclick={reset}
				title="Failed to load — click to retry"
			>
				<ImageOff class="h-6 w-6" />
			</button>
		{/snippet}
	</svelte:boundary>
</div>
