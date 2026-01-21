<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import type { Snippet } from 'svelte';

	let {
		src,
		alt,
		children
	}: {
		src: string;
		alt: string;
		children: Snippet;
	} = $props();

	let open = $state(false);

	function handleDblClick() {
		open = true;
	}
</script>

<Dialog.Root bind:open>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div ondblclick={handleDblClick}>
		{@render children()}
	</div>
	<Dialog.Content
		class="max-h-[90vh] max-w-[90vw] border-none bg-white p-4 pb-16 shadow-2xl"
		showCloseButton={false}
	>
		<img {src} {alt} class="max-h-[calc(90vh-5rem)] max-w-full object-contain" />
		<p class="absolute right-0 bottom-4 left-0 text-center text-sm text-gray-600">{alt}</p>
	</Dialog.Content>
</Dialog.Root>
