<script lang="ts">
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLSelectAttributes } from 'svelte/elements';

	let {
		ref = $bindable(null),
		value = $bindable(),
		class: className,
		children,
		...props
	}: WithElementRef<HTMLSelectAttributes> = $props();
</script>

<select
	bind:this={ref}
	bind:value
	data-slot="input-group-control"
	class={cn(
		'w-full flex-1 rounded-none border-0 bg-transparent px-3 py-1 text-base shadow-none outline-none focus-visible:ring-0 md:text-sm dark:bg-transparent',
		className
	)}
	{...props}
>
	{@render children?.()}
</select>
