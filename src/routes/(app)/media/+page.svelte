<script lang="ts">
	import * as Layout from '$lib/components/layout';
	import * as Load from '$lib/components/load';
	import * as Media from '$lib/components/media';
	import MediaCard from '$lib/components/media/media-card.svelte';
	import MediaEditCard from '$lib/components/media/media-edit-card.svelte';
	import {
		getMediaIds,
		getCurrentMediaIds,
		getMedia,
		publishMedia
	} from '$lib/components/media/media.remote';

	import { SvelteSet } from 'svelte/reactivity';
	import Empty from './empty.svelte';
	import { MEDIA_PAGE_LIMIT } from '$lib/logic/pagination';
	import type { PageProps } from './$types';
	import type { MediaFilter } from '$lib/logic/media';


	let { data }: PageProps = $props();

	let selectMode = $state(false);
	let focusedId = $state<string | null>(null);
	let filter = $state<MediaFilter>({});
	let ids = $state<string[]>(data.init.items);
	let cursor = $state<string | null>(data.init.pagination.cursor ?? null);
	let loading = $state(false);
	let hasMore = $state(data.init.pagination.cursor !== null);
	const selectedIds = new SvelteSet<string>();

	const selectedList = $derived(Array.from(selectedIds));

	function getFilter(): MediaFilter | undefined {
		return Object.keys(filter).length ? filter : undefined;
	}

	async function load(cursorValue: string | null) {
		loading = true;
		try {
			const result = await getMediaIds({ filter: getFilter(), pagination: { limit: MEDIA_PAGE_LIMIT, cursor: cursorValue } });
			ids = cursorValue === null ? result.items : [...ids, ...result.items];
			cursor = result.pagination.cursor ?? null;
			hasMore = result.pagination.cursor !== null;
		} finally {
			loading = false;
		}
	}

	// Reloads all ids up to the current cursor to reflect additions/deletions
	async function refresh() {
		loading = true;
		try {
			await getCurrentMediaIds({ filter: getFilter(), pagination: { cursor } }).refresh();
			ids = await getCurrentMediaIds({ filter: getFilter(), pagination: { cursor } });
		} finally {
			loading = false;
		}
	}

	function handleFilterChange(next: MediaFilter) {
		filter = next;
		cursor = null;
		hasMore = false;
		if (!selectMode) selectedIds.clear();
		load(null);
	}

	function handleSelect(id: string) {
		if (selectMode) {
			if (selectedIds.has(id)) selectedIds.delete(id);
			else selectedIds.add(id);
		} else {
			focusedId = focusedId === id ? null : id;
		}
	}

	function handleDelete(deletedIds: string[]) {
		const deletedSet = new Set(deletedIds);
		ids = ids.filter((id) => !deletedSet.has(id));
		if (focusedId && deletedSet.has(focusedId)) focusedId = null;
		selectedIds.clear();
	}

	function handleRestore() {
		refresh();
	}

	async function handlePublish() {
		await publishMedia(selectedList);
	}
</script>

<Load.Provider oncomplete={() => refresh()}>
	<main class="flex min-h-screen w-full flex-col gap-2">
		<Layout.BaseBar>
			<Media.Toolbar
				{selectMode}
				selectedIds={selectedList}
				{filter}
				onenterselect={() => { selectMode = true; focusedId = null; }}
				onexitselect={() => { selectMode = false; selectedIds.clear(); focusedId = null; }}
				onpublish={handlePublish}
				ondelete={handleDelete}
				onrestore={handleRestore}
				onfilterchange={handleFilterChange}
				onsettovisible={(kept) => { selectedIds.clear(); for (const id of kept) selectedIds.add(id); }}
			/>
		</Layout.BaseBar>

		<Load.Progress />

		{#if ids.length === 0 && !loading}
			<div class="grid min-h-0 flex-1 place-items-center">
				<Empty />
			</div>
		{:else}
			<Media.Grid {ids} {focusedId} {selectedIds} class="mx-3">
				{#snippet children({ id, isFocused, isSelected })}
					{#if isFocused}
						<MediaEditCard
							{id}
							onclose={() => (focusedId = null)}
							ondelete={handleDelete}
							onrestore={handleRestore}
						/>
					{:else}
						<MediaCard {id} {isSelected} onclick={() => handleSelect(id)} />
					{/if}
				{/snippet}
			</Media.Grid>
		{/if}
	</main>

	{#if hasMore && ids.length > 0}
		<Load.InfinityLoad onLoadMore={() => load(cursor)} {loading} />
	{/if}
</Load.Provider>
