<script lang="ts">
	import * as Layout from '$lib/components/layout';
	import * as Load from '$lib/components/load';
	import * as Media from '$lib/components/media';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import * as ButtonGroup from '$lib/components/ui/button-group/index.js';
	import type { MediaState } from '$lib/components/media';
	import type { PageProps } from './$types';
	import { resolve } from '$app/paths';
	import Empty from './empty.svelte';

	const { data }: PageProps = $props();

	let media = $state<MediaState[]>(data.photos.map(Media.mediaToState));
	let detailPanelOpen = $state(false);

	const visible = $derived(media.filter((m) => !m.deleted));

	const selected = $derived(media.filter((m) => m.selected && !m.deleted));

	const handleDelete = (ids: string[]) => {
		const idSet = new Set(ids);
		media.forEach((m) => {
			if (idSet.has(m.media.id)) {
				m.deleted = true;
				m.selected = false;
			}
		});
	};

	const handleRestore = (ids: string[]) => {
		const idSet = new Set(ids);
		media.forEach((m) => {
			if (idSet.has(m.media.id)) {
				m.deleted = false;
			}
		});
	};
</script>

<Sidebar.Provider bind:open={detailPanelOpen}>
	<Load.Provider>
		<main class="flex min-h-screen w-full flex-col gap-2">
			<Layout.BaseBar>
				<ButtonGroup.Root>
					<Media.UploadButton />
				</ButtonGroup.Root>

				{#if selected.length > 0}
					<ButtonGroup.Root>
						<Media.InfoButton bind:open={detailPanelOpen} />
						<Media.DeleteButton {selected} ondelete={handleDelete} onrestore={handleRestore} />
					</ButtonGroup.Root>
				{/if}
			</Layout.BaseBar>

			<Load.Progress />

			{#if visible.length === 0}
				<div class="grid min-h-0 flex-1 place-items-center">
					<Empty />
				</div>
			{:else}
				<Media.Grid media={visible}>
					{#snippet children(state)}
						<Media.Modal
							src={resolve('/(app)/file/[hash]', { hash: state.media.fileHash })}
							alt={state.media.name}
						>
							<Media.Tile {state} />
						</Media.Modal>
					{/snippet}
				</Media.Grid>
			{/if}
		</main>
	</Load.Provider>
	<Layout.DetailSidebar>
		{#snippet header()}
			<Media.DetailHeading {selected} />
		{/snippet}

		<Media.DetailPanel {selected} />
	</Layout.DetailSidebar>
</Sidebar.Provider>
