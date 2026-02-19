<script lang="ts">
	import * as Layout from '$lib/components/layout';
	import * as Load from '$lib/components/load';
	import * as Tag from '$lib/components/tag';
	import * as ButtonGroup from '$lib/components/ui/button-group';
	import { getTagIds, getTagWithStatus, getCurrentIds } from '$lib/components/tag/tags.remote';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Plus } from '@lucide/svelte';
	import type { Tag as TagType } from '$lib/logic/tag';

	const LIMIT = 24;

	let search = $state('');
	let expandedId = $state<string | null>(null);
	let creating = $state(false);

	let ids = $state<string[]>([]);
	let cursor = $state<string | null>(null);
	let loading = $state(false);
	let hasMore = $state(true);

	async function load(searchValue: string, cursorValue: string | null) {
		loading = true;
		try {
			const result = await getTagIds({
				filter: searchValue ? { search: searchValue } : undefined,
				pagination: { limit: LIMIT, cursor: cursorValue }
			});
			ids = cursorValue === null ? result.items : [...ids, ...result.items];
			cursor = result.pagination.cursor ?? null;
			hasMore = result.pagination.cursor !== null;
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		load(search, null);
	});
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
		<Input placeholder="Search tags..." bind:value={search} class="max-w-xs" />
	</Layout.BaseBar>

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
						filter: search ? { search } : undefined,
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

	{#if hasMore && ids.length > 0}
		<Load.InfinityLoad onLoadMore={() => load(search, cursor)} {loading} />
	{/if}
</main>
