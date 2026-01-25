<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet';
	import { TagInput } from '$lib/components/form';
	import type { MediaState } from './types';
	import type { Tag } from '$lib/logic/tag';
	import * as tagApi from '$lib/api/tag';

	type Props = {
		open: boolean;
		selected: MediaState[];
		onOpenChange?: (open: boolean) => void;
	};

	let { open = $bindable(), selected, onOpenChange }: Props = $props();

	let allTags = $state<Tag[]>([]);
	let mediaTags = $state<Map<string, Tag[]>>(new Map());
	let loading = $state(false);

	const loadTags = async () => {
		loading = true;
		allTags = await tagApi.getTags();
		// TODO: Load tags for selected media items
		loading = false;
	};

	$effect(() => {
		if (open && selected.length > 0) {
			loadTags();
		}
	});

	let tagNames = $state<string[]>([]);
	let previousTagNames = $state<string[]>([]);

	// Sync tagNames when selection changes
	$effect(() => {
		if (selected.length === 0) {
			tagNames = [];
			previousTagNames = [];
			return;
		}
		// TODO: Calculate common tags across selected items from mediaTags
		tagNames = [];
		previousTagNames = [];
	});

	// React to tag changes and call API
	$effect(() => {
		const current = [...tagNames];
		const previous = previousTagNames;

		if (current.length === previous.length && current.every((t, i) => t === previous[i])) {
			return;
		}

		const added = current.filter((t) => !previous.includes(t));
		const removed = previous.filter((t) => !current.includes(t));

		if (added.length === 0 && removed.length === 0) {
			previousTagNames = current;
			return;
		}

		const hashes = selected.map((s) => s.media.hash);

		(async () => {
			for (const name of added) {
				let tag = allTags.find((t) => t.name === name);
				if (!tag) {
					tag = await tagApi.createTag({ name });
					if (tag) allTags = [...allTags, tag];
				}
				if (tag) {
					await tagApi.addTagToMedia(tag.id, hashes);
				}
			}

			for (const name of removed) {
				const tag = allTags.find((t) => t.name === name);
				if (tag) {
					await tagApi.removeTagFromMedia(tag.id, hashes);
				}
			}

			previousTagNames = current;
		})();
	});
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
				<TagInput bind:value={tagNames} placeholder="Add tag..." />
			</div>
		</div>
	</Sheet.Content>
</Sheet.Root>
