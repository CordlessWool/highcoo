<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	export type GridItem = { id: string; isPrimary: boolean; isSelected: boolean };

	type Props = {
		ids: string[];
		selectedIds: Set<string>;
		selectMode?: boolean;
		children: Snippet<[GridItem]>;
	} & Omit<HTMLAttributes<HTMLDivElement>, 'children'>;

	let { ids, selectedIds, selectMode = false, children, class: className, ...props }: Props = $props();

	const primaryId = $derived(selectMode ? null : (Array.from(selectedIds)[0] ?? null));
</script>

<div
	{...props}
	class={cn('grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5', className)}
>
	{#each ids as id (id)}
		{@render children({ id, isPrimary: id === primaryId, isSelected: selectedIds.has(id) })}
	{/each}
</div>
