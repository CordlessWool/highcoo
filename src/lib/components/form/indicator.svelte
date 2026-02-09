<script lang="ts">
	import { Loader2, Check, CircleAlert } from '@lucide/svelte';
	import { cn } from '$lib/utils';
	import { SaveStatus } from './helper';

	type Props = {
		status: SaveStatus;
		class?: string;
	};

	let { status, class: className }: Props = $props();
</script>

{#if status === SaveStatus.Saving}
	<Loader2 class={cn('size-4 animate-spin text-muted-foreground', className)} />
{:else if status === SaveStatus.Saved}
	<Check class={cn('size-4 text-green-500', className)} />
{:else if status === SaveStatus.Error}
	<CircleAlert class={cn('size-4 text-destructive', className)} />
{/if}
