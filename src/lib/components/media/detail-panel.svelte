<script lang="ts">
	import MediaTagInput from './media-tag-input.svelte';
	import type { MediaState } from './types';

	type Props = {
		selected: MediaState[];
	};

	let { selected }: Props = $props();
</script>

<div class="flex flex-col gap-3 px-2">
	{#if selected.length > 0}
		<div class="space-y-2">
			<h3 class="text-sm font-medium">Tags</h3>
			<MediaTagInput mediaIds={selected.map((s) => s.media.id)} />
		</div>
	{/if}
</div>
