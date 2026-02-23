<script lang="ts">
	import * as Layout from '$lib/components/layout';
	import * as Load from '$lib/components/load';
	import * as Tag from '$lib/components/tag';
	import * as ButtonGroup from '$lib/components/ui/button-group';
	import * as Filter from '$lib/components/filter';
	import { getTagIds, getTagWithStatus, getCurrentIds } from '$lib/components/tag/tags.remote';
	import { Button } from '$lib/components/ui/button';
	import { Plus } from '@lucide/svelte';
	import type { Tag as TagType } from '$lib/logic/tag';
	import type { PageProps } from './$types';
	import { TAG_PAGE_LIMIT } from '$lib/logic/pagination';
	import Empty from './empty.svelte';


	let { data }: PageProps = $props();

	let filters = $state<{ search?: string }>({});
	let expandedId = $state<string | null>(null);
	let creating = $state(false);

	// svelte-ignore state_referenced_locally
	let ids = $state<string[]>(data.init.items);
	// svelte-ignore state_referenced_locally
	let cursor = $state<string | null>(data.init.pagination.cursor ?? null);
	let loading = $state(false);
	// svelte-ignore state_referenced_locally
	let hasMore = $state(data.init.pagination.cursor !== null);

	function getFilter() {
		return filters.search ? { search: filters.search } : undefined;
	}

	async function load(cursorValue: string | null) {
		loading = true;
		try {
			const result = await getTagIds({
				filter: getFilter(),
				pagination: { limit: TAG_PAGE_LIMIT, cursor: cursorValue }
			});
			ids = cursorValue === null ? result.items : [...ids, ...result.items];
			cursor = result.pagination.cursor ?? null;
			hasMore = result.pagination.cursor !== null;
		} finally {
			loading = false;
		}
	}

	function handleSearch(value: string) {
		filters.search = value || undefined;
		cursor = null;
		hasMore = false;
		load(null);
	}

</script>

<main class="flex min-h-screen w-full flex-col gap-2">
	<Layout.BaseBar>
		<ButtonGroup.Root>
			<Button
				variant="outline"
				size="sm"
				onclick={() => {
					expandedId = null;
					creating = true;
				}}
			>
				<Plus class="h-4 w-4" />
				Create Tag
			</Button>
		</ButtonGroup.Root>
		<Filter.Search onsearch={handleSearch} placeholder="Search tags…" class="h-8 max-w-xs" />
	</Layout.BaseBar>

	{#if ids.length === 0 && !loading && !creating}
		<div class="grid min-h-0 flex-1 place-items-center">
			<Empty />
		</div>
	{:else}
	<div
		class="grid auto-rows-[10rem] grid-cols-1 gap-4 p-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
	>
		{#if creating}
			<Tag.CreateCard
				oncreate={async (tag: TagType) => {
					creating = false;
					getTagWithStatus(tag.id).set({
						...tag,
						hasDraft: false,
						isDirty: false,
						isPublished: false
					});
					ids = await getCurrentIds({
						filter: getFilter(),
						pagination: { cursor: cursor ?? undefined }
					});
					expandedId = tag.id;
				}}
				oncancel={() => {
					creating = false;
				}}
			/>
		{/if}

		{#each ids as id (id)}
			{@const tag = await getTagWithStatus(id)}
			{#if tag}
				{#if id === expandedId}
					<Tag.EditCard
						{tag}
						onclose={() => {
							expandedId = null;
						}}
					/>
				{:else}
					<Tag.ViewCard
						{tag}
						onclick={() => {
							expandedId = id;
							creating = false;
						}}
					/>
				{/if}
			{/if}
		{/each}
	</div>
	{/if}

	{#if hasMore && ids.length > 0}
		<Load.InfinityLoad onLoadMore={() => load(cursor)} {loading} />
	{/if}
</main>
