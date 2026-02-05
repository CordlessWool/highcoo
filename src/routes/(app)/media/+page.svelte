<script lang="ts">
	import * as Layout from '$lib/components/layout';
	import * as Load from '$lib/components/load';
	import * as Media from '$lib/components/media';
	import * as ButtonGroup from '$lib/components/ui/button-group/index.js';
	import type { MediaState } from '$lib/components/media';
	import type { PageProps } from './$types';
	import Empty from './empty.svelte';

	const { data }: PageProps = $props();

	let media = $state<MediaState[]>(data.photos.map(Media.mediaToState));

	const visible = $derived(media.filter((m) => !m.deleted));

	const selected = $derived(media.filter((m) => m.selected && !m.deleted));

	const handleDelete = (hashes: string[]) => {
		const hashSet = new Set(hashes);
		media.forEach((m) => {
			if (hashSet.has(m.media.hash)) {
				m.deleted = true;
				m.selected = false;
			}
		});
	};

	const handleRestore = (hashes: string[]) => {
		const hashSet = new Set(hashes);
		media.forEach((m) => {
			if (hashSet.has(m.media.hash)) {
				m.deleted = false;
			}
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
					<Media.InfoButton {selected} />
					<Media.DeleteButton {selected} ondelete={handleDelete} onrestore={handleRestore} />
				</ButtonGroup.Root>
			{/if}
		</ButtonGroup.Root>

		<Load.Progress />

		{#if visible.length === 0}
			<div class="grid min-h-0 flex-1 place-items-center">
				<Empty />
			</div>
		{:else}
			<Media.Grid media={visible}>
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
