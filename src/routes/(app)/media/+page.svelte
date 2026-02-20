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
	import type { PageProps } from './$types';

	const LIMIT = 24;

	let { data }: PageProps = $props();

	let selectMode = $state(false);
	let search = $state('');
	let ids = $state<string[]>(data.init.items);
	let cursor = $state<string | null>(data.init.pagination.cursor ?? null);
	let loading = $state(false);
	let hasMore = $state(data.init.pagination.cursor !== null);
	const selectedIds = new SvelteSet<string>();

	const selectedList = $derived(Array.from(selectedIds));

	function getFilter() {
		return search ? { search } : undefined;
	}

	async function load(cursorValue: string | null) {
		loading = true;
		try {
			const result = await getMediaIds({ filter: getFilter(), pagination: { limit: LIMIT, cursor: cursorValue } });
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

	function handleSearch(value: string) {
		search = value;
		cursor = null;
		hasMore = false;
		load(null);
	}

	function handleSelect(id: string, e: MouseEvent) {
		if (selectMode || e.shiftKey || e.ctrlKey || e.metaKey) {
			if (selectedIds.has(id)) {
				selectedIds.delete(id);
			} else {
				selectedIds.add(id);
			}
		} else {
			selectedIds.clear();
			selectedIds.add(id);
		}
	}

	function handleDelete(deletedIds: string[]) {
		const deletedSet = new Set(deletedIds);
		ids = ids.filter((id) => !deletedSet.has(id));
		selectedIds.clear();
	}

	function handleRestore() {
		refresh();
	}

	async function handlePublish() {
		const items = await Promise.all(selectedList.map((id) => getMedia(id)));
		const dirtyIds = items.filter((m) => m?.dirty).map((m) => m!.id);
		if (dirtyIds.length === 0) return;
		await publishMedia(dirtyIds);
	}

	const dirtyCount = $derived.by(async () => {
		if (selectedIds.size === 0) return 0;
		const items = await Promise.all(selectedList.map((id) => getMedia(id)));
		return items.filter((m) => m?.dirty).length;
	});
</script>

<Load.Provider oncomplete={() => refresh()}>
	<main class="flex min-h-screen w-full flex-col gap-2">
		<Layout.BaseBar>
			<Media.Toolbar
				{selectMode}
				selectedIds={selectedList}
				dirtyCount={await dirtyCount}
				onenterselect={() => (selectMode = true)}
				onexitselect={() => { selectMode = false; selectedIds.clear(); }}
				onpublish={handlePublish}
				ondelete={handleDelete}
				onrestore={handleRestore}
				onsearch={handleSearch}
			/>
		</Layout.BaseBar>

		<Load.Progress />

		{#if ids.length === 0 && !loading}
			<div class="grid min-h-0 flex-1 place-items-center">
				<Empty />
			</div>
		{:else}
			<Media.Grid {ids} {selectedIds} {selectMode} class="mx-3">
				{#snippet children({ id, isPrimary, isSelected })}
					{#if isPrimary}
						<MediaEditCard
							selectedIds={selectedList}
							onclose={() => selectedIds.clear()}
							ondelete={handleDelete}
							onrestore={handleRestore}
						/>
					{:else}
						<MediaCard {id} {isSelected} onclick={(e) => handleSelect(id, e)} />
					{/if}
				{/snippet}
			</Media.Grid>
		{/if}
	</main>

	{#if hasMore && ids.length > 0}
		<Load.InfinityLoad onLoadMore={() => load(cursor)} {loading} />
	{/if}
</Load.Provider>
