<script lang="ts">
	import { resolve } from '$app/paths';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import type { MediaState } from './types';

	type Props = {
		state: MediaState;
		onclick?: (e: MouseEvent) => void;
	};
	const { state: media, onclick, ...props }: Props = $props();

	const src = $derived(resolve('/(app)/file/[hash]', { hash: media.media.fileHash }));

	let modalOpen = $state(false);
</script>

<button
	type="button"
	class="relative m-2 block max-h-fit max-w-fit overflow-hidden rounded-lg shadow-sm dark:shadow-none"
	class:ring-2={media.selected}
	class:ring-primary={media.selected}
	class:ring-offset-2={media.selected}
	class:ring-offset-background={media.selected}
	{onclick}
	ondblclick={() => (modalOpen = true)}
>
	<img
		src="{src}?w=600"
		class="relative max-h-full rounded-lg object-contain"
		alt={media.media.name}
	/>
	{#if media.media.dirty}
		<span
			class="absolute top-1.5 right-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-orange-500 dark:border-background"
			title="Unpublished changes"
		></span>
	{/if}
</button>
<Dialog.Root bind:open={modalOpen}>
	<Dialog.Content
		class="inline-flex flex-col gap-0 border-none bg-white p-2 pb-0 shadow-lg ring-0 outline-none"
		showCloseButton={false}
	>
		<img {src} alt={media.media.name} class="object-contain" />
		<p class="my-5 text-center text-sm text-gray-600">{media.media.name}</p>
	</Dialog.Content>
</Dialog.Root>
