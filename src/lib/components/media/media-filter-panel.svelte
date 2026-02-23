<script lang="ts">
	import * as Popover from '$lib/components/ui/popover';
	import { Button } from '$lib/components/ui/button';
	import { ListFilter, Check } from '@lucide/svelte';
	import { getTags } from '$lib/components/tag/tags.remote';
	import { MediaStatusValues, type MediaFilter, type MediaStatus } from '$lib/logic/media';

	type Props = {
		filter: MediaFilter;
		onfilterchange: (filter: MediaFilter) => void;
	};

	let { filter, onfilterchange }: Props = $props();

	const status = $derived(filter.status ?? []);
	const tagIds = $derived(filter.tagIds ?? []);
	const hasActiveFilter = $derived(status.length > 0 || tagIds.length > 0);

	const STATUS_OPTIONS = MediaStatusValues.map((v) => ({
		value: v,
		label: v.charAt(0).toUpperCase() + v.slice(1)
	}));

	let tagSearch = $state('');

	const MAX_TAGS = 10;

	const visibleTags = $derived(
		await Promise.all([
			getTags({ pagination: { limit: 100 } }),
			getTags({
				filter: tagSearch ? { search: tagSearch } : undefined,
				pagination: { limit: MAX_TAGS }
			})
		]).then(([selectedResult, searchResult]) => {
			const selected = selectedResult.items.filter((t) => tagIds.includes(t.id));
			const remaining = MAX_TAGS - selected.length;
			const unselected = searchResult.items
				.filter((t) => !tagIds.includes(t.id))
				.slice(0, remaining);
			return [...selected, ...unselected];
		})
	);

	function toggleStatus(value: MediaStatus) {
		const next = status.includes(value) ? status.filter((v) => v !== value) : [...status, value];
		onfilterchange({ ...filter, status: next.length ? next : undefined });
	}

	function toggleTag(id: string) {
		const next = tagIds.includes(id) ? tagIds.filter((v) => v !== id) : [...tagIds, id];
		onfilterchange({ ...filter, tagIds: next.length ? next : undefined });
	}
</script>

<Popover.Root>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button variant="outline" size="icon-sm" {...props}>
				<div class="relative">
					<ListFilter />
					{#if hasActiveFilter}
						<span class="absolute -top-1 -right-1 h-1.5 w-1.5 rounded-full bg-primary"></span>
					{/if}
				</div>
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content align="center" class="w-auto p-0">
		<div class="flex divide-x">
			<!-- Status column -->
			<div class="flex w-40 flex-col p-3">
				<div class="mb-2 flex items-center justify-between">
					<span class="text-xs font-medium">Status</span>
					{#if status.length > 0}
						<button
							class="text-xs text-muted-foreground underline-offset-2 hover:underline"
							onclick={() => onfilterchange({ ...filter, status: undefined })}
						>
							Clear
						</button>
					{/if}
				</div>
				<div class="flex flex-col gap-0.5">
					{#each STATUS_OPTIONS as opt (opt.value)}
						<button
							class="flex items-center gap-2 rounded px-2 py-1 text-left text-sm hover:bg-accent hover:text-accent-foreground"
							onclick={() => toggleStatus(opt.value)}
						>
							<Check
								class="h-3.5 w-3.5 {status.includes(opt.value) ? 'opacity-100' : 'opacity-0'}"
							/>
							{opt.label}
						</button>
					{/each}
				</div>
			</div>

			<!-- Tags column -->
			<div class="flex w-72 flex-col p-3">
				<div class="mb-2 flex items-center justify-between">
					<span class="text-xs font-medium">Tags</span>
					{#if tagIds.length > 0}
						<button
							class="text-xs text-muted-foreground underline-offset-2 hover:underline"
							onclick={() => onfilterchange({ ...filter, tagIds: undefined })}
						>
							Clear
						</button>
					{/if}
				</div>
				<input
					class="mb-2 h-7 w-full rounded border bg-background px-2 text-xs focus:ring-1 focus:ring-ring focus:outline-none"
					placeholder="Search…"
					bind:value={tagSearch}
				/>
				<div class="grid grid-cols-2 gap-0.5">
					{#each visibleTags as tag (tag.id)}
						<button
							class="flex items-center gap-2 rounded px-2 py-1 text-left text-sm hover:bg-accent hover:text-accent-foreground"
							onclick={() => toggleTag(tag.id)}
						>
							<Check class="h-3.5 w-3.5 {tagIds.includes(tag.id) ? 'opacity-100' : 'opacity-0'}" />
							{tag.name}
						</button>
					{/each}
				</div>
			</div>
		</div>
	</Popover.Content>
</Popover.Root>
