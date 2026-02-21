<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as ButtonGroup from '$lib/components/ui/button-group';
	import { Send } from '@lucide/svelte';
	import * as Filter from '$lib/components/filter';
	import MediaFilterPanel from './media-filter-panel.svelte';
	import DeleteButton from './delete-button.svelte';
	import UploadButton from './upload-button.svelte';
	import { filterMediaIds } from './media.remote';
	import type { MediaFilter } from '$lib/logic/media';

	type Props = {
		selectMode: boolean;
		selectedIds: string[];
		filter: MediaFilter;
		onenterselect: () => void;
		onexitselect: () => void;
		onpublish: () => void;
		ondelete: (ids: string[]) => void;
		onrestore: () => void;
		onfilterchange: (filter: MediaFilter) => void;
		onsettovisible: (ids: string[]) => void;
	};

	let {
		selectMode,
		selectedIds,
		filter,
		onenterselect,
		onexitselect,
		onpublish,
		ondelete,
		onrestore,
		onfilterchange,
		onsettovisible
	}: Props = $props();

	const activeFilter = $derived(Object.keys(filter).length ? filter : undefined);

	const filteredSelectedIds = $derived(
		selectedIds.length > 0 && activeFilter
			? await filterMediaIds({ ids: selectedIds, filter: activeFilter })
			: selectedIds
	);

	const hiddenSelectedCount = $derived(selectedIds.length - filteredSelectedIds.length);
</script>

{#if selectMode}
	<div class="flex flex-col">
		<span class="text-sm text-muted-foreground">{selectedIds.length} selected</span>
		{#if hiddenSelectedCount > 0}
			<button class="text-left text-xs text-muted-foreground underline-offset-2 hover:underline" onclick={() => onsettovisible(filteredSelectedIds)}>
				Set to visible ({filteredSelectedIds.length})
			</button>
		{/if}
	</div>
	<MediaFilterPanel {filter} {onfilterchange} />
{:else}
	<ButtonGroup.Root>
		<Filter.Search value={filter.search} onsearch={(v) => onfilterchange({ ...filter, search: v || undefined })} class="h-8 w-48" />
		<MediaFilterPanel {filter} {onfilterchange} />
	</ButtonGroup.Root>
{/if}

<div class="ml-auto flex items-center gap-2">
	{#if selectMode}
		<DeleteButton selected={selectedIds} {ondelete} {onrestore} />
		<Button variant="outline" size="sm" onclick={onpublish} disabled={selectedIds.length === 0}>
			<Send class="h-4 w-4" />
			Publish
		</Button>
		<Button variant="outline" size="sm" onclick={onexitselect}>
			Done
		</Button>
	{:else}
		<UploadButton variant="outline" size="sm" />
		<Button variant="outline" size="sm" onclick={onenterselect}>
			Select
		</Button>
	{/if}
</div>
