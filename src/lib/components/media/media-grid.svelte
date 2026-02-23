<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	export type GridItem = { id: string; isFocused: boolean; isSelected: boolean };

	type Props = {
		ids: string[];
		focusedId: string | null;
		selectedIds: Set<string>;
		children: Snippet<[GridItem]>;
	} & Omit<HTMLAttributes<HTMLDivElement>, 'children'>;

	let { ids, focusedId, selectedIds, children, class: className, ...props }: Props = $props();
</script>

<div
	{...props}
	class={cn('grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5', className)}
>
	{#each ids as id (id)}
		{@render children({ id, isFocused: id === focusedId, isSelected: selectedIds.has(id) })}
	{/each}
</div>
