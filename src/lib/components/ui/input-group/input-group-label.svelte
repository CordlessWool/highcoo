<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import type { ComponentProps } from 'svelte';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: ComponentProps<typeof Label> = $props();
</script>

<Label bind:ref class={cn('h-6 text-foreground', className)} {...restProps} />
