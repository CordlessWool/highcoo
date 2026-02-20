<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Send } from '@lucide/svelte';
	import DeleteButton from './delete-button.svelte';
	import UploadButton from './upload-button.svelte';

	type Props = {
		selectMode: boolean;
		selectedIds: string[];
		dirtyCount: number;
		onenterselect: () => void;
		onexitselect: () => void;
		onpublish: () => void;
		ondelete: (ids: string[]) => void;
		onrestore: () => void;
	};

	let {
		selectMode,
		selectedIds,
		dirtyCount,
		onenterselect,
		onexitselect,
		onpublish,
		ondelete,
		onrestore
	}: Props = $props();
</script>

{#if selectMode}
	<span class="text-sm text-muted-foreground">{selectedIds.length} selected</span>
{/if}

<div class="ml-auto flex items-center gap-2">
	{#if selectMode}
		<DeleteButton selected={selectedIds} {ondelete} {onrestore} />
		<Button variant="outline" size="sm" onclick={onexitselect}>
			Done
		</Button>
	{:else}
		{#if dirtyCount > 0}
			<Button variant="outline" size="sm" onclick={onpublish}>
				<Send class="h-4 w-4" />
				Publish
				<span class="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
					{dirtyCount}
				</span>
			</Button>
		{/if}
		<UploadButton variant="outline" size="sm" />
		<Button variant="outline" size="sm" onclick={onenterselect}>
			Select
		</Button>
	{/if}
</div>
