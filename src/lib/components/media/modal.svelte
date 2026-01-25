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
		class="inline-flex flex-col gap-0 border-none bg-white p-2 pb-0 shadow-lg ring-0 outline-none"
		showCloseButton={false}
	>
		<img {src} {alt} class="object-contain" />
		<p class="my-5 text-center text-sm text-gray-600">{alt}</p>
	</Dialog.Content>
</Dialog.Root>
