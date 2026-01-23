<script lang="ts">
	import * as Layout from '$lib/components/layout';
	import * as Load from '$lib/components/load';
	import * as ButtonGroup from '$lib/components/ui/button-group/index.js';
	import {
		UploadButton,
		ImageModal,
		PhotoGrid,
		DeleteButton,
		photoToState
	} from '$lib/components/media';
	import type { PhotoState, DeletedItem } from '$lib/components/media/types';
	import type { PageProps } from './$types';
	import Empty from './empty.svelte';

	const { data }: PageProps = $props();

	let photos = $state<PhotoState[]>(data.photos.map(photoToState));

	const selected = $derived(
		photos.map((item, index) => ({ item, index })).filter((entry) => entry.item.selected)
	);

	const handleDelete = (items: DeletedItem[]) => {
		const hashes = new Set(items.map((i) => i.item.photo.hash));
		photos = photos.filter((p) => !hashes.has(p.photo.hash));
	};

	const handleRestore = (items: DeletedItem[]) => {
		items.forEach(({ item, index }) => {
			photos.splice(index, 0, { ...item, selected: false });
		});
	};
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

			{#if selected.length > 0}
				<ButtonGroup.Root>
					<DeleteButton {selected} ondelete={handleDelete} onrestore={handleRestore} />
				</ButtonGroup.Root>
			{/if}
		</ButtonGroup.Root>

		<Load.Progress />

		{#if photos.length === 0}
			<div class="grid min-h-0 flex-1 place-items-center">
				<Empty />
			</div>
		{:else}
			<PhotoGrid bind:photos>
				{#snippet item(photoState)}
					<ImageModal src="/api/files/{photoState.photo.slug}" alt={photoState.photo.name}>
						<div class="flex aspect-square items-center justify-center">
							<img
								src="/api/files/{photoState.photo.slug}"
								alt={photoState.photo.name}
								class="max-h-full max-w-full rounded-lg"
								class:ring-2={photoState.selected}
								class:ring-primary={photoState.selected}
								class:ring-offset-2={photoState.selected}
							/>
						</div>
					</ImageModal>
				{/snippet}
			</PhotoGrid>
		{/if}
	</main>
</Load.Provider>
