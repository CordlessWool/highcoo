<script lang="ts">
	import { Loader2, Check, CircleAlert } from '@lucide/svelte';
	import { SaveStatus } from './helper';

	type Props = {
		status: SaveStatus;
	};

	let { status }: Props = $props();
</script>

{#if status === SaveStatus.Saving}
	<Loader2 class="size-4 animate-spin text-muted-foreground" />
{:else if status === SaveStatus.Saved}
	<Check class="size-4 text-green-500" />
{:else if status === SaveStatus.Error}
	<CircleAlert class="size-4 text-destructive" />
{/if}
