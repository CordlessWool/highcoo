<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as ButtonGroup from '$lib/components/ui/button-group';
	import { Send } from '@lucide/svelte';
	import * as Filter from '$lib/components/filter';
	import MediaFilterPanel from './media-filter-panel.svelte';
	import DeleteButton from './delete-button.svelte';
	import UploadButton from './upload-button.svelte';
	import type { MediaFilter } from '$lib/logic/media';

	type Props = {
		selectMode: boolean;
		selectedIds: string[];
		dirtyCount: number;
		filter: MediaFilter;
		onenterselect: () => void;
		onexitselect: () => void;
		onpublish: () => void;
		ondelete: (ids: string[]) => void;
		onrestore: () => void;
		onfilterchange: (filter: MediaFilter) => void;
	};

	let {
		selectMode,
		selectedIds,
		dirtyCount,
		filter,
		onenterselect,
		onexitselect,
		onpublish,
		ondelete,
		onrestore,
		onfilterchange
	}: Props = $props();
</script>

{#if selectMode}
	<span class="text-sm text-muted-foreground">{selectedIds.length} selected</span>
{:else}
	<ButtonGroup.Root>
		<Filter.Search value={filter.search} onsearch={(v) => onfilterchange({ ...filter, search: v || undefined })} class="h-8 w-48" />
		<MediaFilterPanel {filter} {onfilterchange} />
	</ButtonGroup.Root>
{/if}

<div class="ml-auto flex items-center gap-2">
	{#if selectMode}
		<DeleteButton selected={selectedIds} {ondelete} {onrestore} />
		<Button variant="outline" size="sm" onclick={onpublish} disabled={dirtyCount === 0}>
			<Send class="h-4 w-4" />
			Publish
			{#if dirtyCount > 0}
				<span class="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
					{dirtyCount}
				</span>
			{/if}
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
