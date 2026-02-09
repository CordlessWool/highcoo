<script lang="ts">
	import type { MediaState } from './types';

	type Props = {
		selected: MediaState[];
	};

	let { selected }: Props = $props();
</script>

<div class="mb-3">
	<h2 class="mt-1 mb-0 text-lg font-semibold">
		{#if selected.length === 1}
			Details
		{:else}
			{selected.length} items selected
		{/if}
	</h2>
	{#if selected.length > 1}
		<p class="text-xs text-muted-foreground">Changes apply to all selected items</p>
	{/if}
</div>
