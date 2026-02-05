<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet';
	import MediaTagInput from './media-tag-input.svelte';
	import type { MediaState } from './types';

	type Props = {
		open: boolean;
		selected: MediaState[];
		onOpenChange?: (open: boolean) => void;
	};

	let { open = $bindable(), selected, onOpenChange }: Props = $props();
</script>

<Sheet.Root bind:open {onOpenChange}>
	<Sheet.Content>
		<Sheet.Header>
			<Sheet.Title>
				{#if selected.length === 1}
					{selected[0].media.name}
				{:else}
					{selected.length} items selected
				{/if}
			</Sheet.Title>
		</Sheet.Header>

		<div class="flex flex-col gap-4 p-4">
			{#if selected.length === 1}
				<div class="aspect-square overflow-hidden rounded-lg">
					<img
						src="/api/media/{selected[0].media.slug}"
						alt={selected[0].media.name}
						class="h-full w-full object-cover"
					/>
				</div>
			{:else}
				<div class="grid grid-cols-3 gap-1">
					{#each selected.slice(0, 9) as item}
						<div class="aspect-square overflow-hidden rounded">
							<img
								src="/api/media/{item.media.slug}"
								alt={item.media.name}
								class="h-full w-full object-cover"
							/>
						</div>
					{/each}
				</div>
			{/if}

			<div class="space-y-2">
				<h3 class="text-sm font-medium">Tags</h3>
				<MediaTagInput hashes={selected.map((s) => s.media.hash)} />
			</div>
		</div>
	</Sheet.Content>
</Sheet.Root>
