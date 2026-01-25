<script lang="ts">
	import * as Layout from '$lib/components/layout';
	import * as Load from '$lib/components/load';
	import * as Media from '$lib/components/media';
	import * as ButtonGroup from '$lib/components/ui/button-group/index.js';
	import type { MediaState, DeletedItem } from '$lib/components/media';
	import type { PageProps } from './$types';
	import Empty from './empty.svelte';

	const { data }: PageProps = $props();

	let media = $state<MediaState[]>(data.photos.map(Media.mediaToState));

	const selected = $derived(
		media.map((item, index) => ({ item, index })).filter((entry) => entry.item.selected)
	);

	const handleDelete = (deleted: DeletedItem[]) => {
		const hashes = new Set(deleted.map((i) => i.item.media.hash));
		media = media.filter((m) => !hashes.has(m.media.hash));
	};

	const handleRestore = (restored: DeletedItem[]) => {
		restored.forEach(({ item, index }) => {
			media.splice(index, 0, { ...item, selected: false });
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
				<Media.UploadButton />
			</ButtonGroup.Root>

			{#if selected.length > 0}
				<ButtonGroup.Root>
					<Media.DeleteButton {selected} ondelete={handleDelete} onrestore={handleRestore} />
				</ButtonGroup.Root>
			{/if}
		</ButtonGroup.Root>

		<Load.Progress />

		{#if media.length === 0}
			<div class="grid min-h-0 flex-1 place-items-center">
				<Empty />
			</div>
		{:else}
			<Media.Grid bind:media>
				{#snippet children(state)}
					<Media.Modal src="/api/media/{state.media.slug}" alt={state.media.name}>
						<div class="flex aspect-square items-center justify-center">
							<img
								src="/api/media/{state.media.slug}"
								alt={state.media.name}
								class="max-h-full max-w-full rounded-lg"
								class:ring-2={state.selected}
								class:ring-primary={state.selected}
								class:ring-offset-2={state.selected}
							/>
						</div>
					</Media.Modal>
				{/snippet}
			</Media.Grid>
		{/if}
	</main>
</Load.Provider>
