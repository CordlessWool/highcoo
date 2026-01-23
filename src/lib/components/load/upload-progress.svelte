<script lang="ts">
	import { slide } from 'svelte/transition';
	import { Progress } from '$lib/components/ui/progress';
	import { getUploadContext } from './upload-context.svelte';

	const ctx = getUploadContext();
	const percentage = $derived(ctx.total > 0 ? Math.round((ctx.completed / ctx.total) * 100) : 0);
</script>

{#if ctx.total !== 0}
	<div
		class="flex items-center gap-3 rounded-lg bg-muted p-3"
		in:slide={{ duration: 700 }}
		out:slide={{ duration: 1000, delay: 5000 }}
	>
		<Progress value={percentage} max={100} class="flex-1" />
		<span class="text-sm text-muted-foreground">
			{ctx.completed}/{ctx.total}
		</span>
		{#if ctx.errors > 0}
			<span class="text-sm text-destructive">
				({ctx.errors} failed)
			</span>
		{/if}
	</div>
{/if}
