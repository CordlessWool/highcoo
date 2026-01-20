<script lang="ts">
	import * as Layout from '$lib/components/layout';
	import * as ButtonGroup from '$lib/components/ui/button-group/index.js';
	import { handleFiles } from '$lib/logic/upload';
	import type { PageProps } from './$types';
	import Empty from './empty.svelte';

	const { data }: PageProps = $props();
</script>

<main class="flex min-h-screen w-full flex-col p-2">
	<ButtonGroup.Root>
		<Layout.SidebarTriggerButton variant="secondary" />
	</ButtonGroup.Root>

	{#if data.photos.length === 0}
		<div class="grid min-h-0 flex-1 place-items-center">
			<Empty onfiles={handleFiles} />
		</div>
	{:else}
		<div class="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6">
			{#each data.photos as photo (photo.hash)}
				<div class="flex aspect-square items-center justify-center">
					<img
						src="/api/files/{photo.slug}"
						alt={photo.name}
						class="max-h-full max-w-full rounded-lg"
					/>
				</div>
			{/each}
		</div>
	{/if}
</main>
