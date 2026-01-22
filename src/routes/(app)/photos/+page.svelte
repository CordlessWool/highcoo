<script lang="ts">
	import * as Layout from '$lib/components/layout';
	import * as Load from '$lib/components/load';
	import * as ButtonGroup from '$lib/components/ui/button-group/index.js';
	import { UploadButton, ImageModal } from '$lib/components/media';
	import type { PageProps } from './$types';
	import Empty from './empty.svelte';

	const { data }: PageProps = $props();
</script>

<Load.Provider>
	<main class="flex min-h-screen w-full flex-col gap-2 p-2">
		<ButtonGroup.Root>
			<ButtonGroup.Root>
				<Layout.SidebarTriggerButton variant="secondary" />
			</ButtonGroup.Root>

			<ButtonGroup.Root>
				<UploadButton />
			</ButtonGroup.Root>
		</ButtonGroup.Root>

		<Load.Progress />

		{#if data.photos.length === 0}
			<div class="grid min-h-0 flex-1 place-items-center">
				<Empty />
			</div>
		{:else}
			<div class="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
				{#each data.photos as photo (photo.hash)}
					<ImageModal src="/api/files/{photo.slug}" alt={photo.name}>
						<div class="flex aspect-square items-center justify-center">
							<img
								src="/api/files/{photo.slug}"
								alt={photo.name}
								class="max-h-full max-w-full rounded-lg"
							/>
						</div>
					</ImageModal>
				{/each}
			</div>
		{/if}
	</main>
</Load.Provider>
