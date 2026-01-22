<script lang="ts">
	import { slide } from 'svelte/transition';
	import { Progress } from '$lib/components/ui/progress';
	import { getUploadContext } from './upload-context.svelte';
	import { tick } from 'svelte';

	const ctx = getUploadContext();
	console.log(ctx);
	$effect(() => console.log(ctx));
	const percentage = $derived(ctx.total > 0 ? Math.round((ctx.completed / ctx.total) * 100) : 0);
	const isComplete = $derived(ctx.completed >= ctx.total);
	let show = $state(false);

	$effect(() => {
		console.log('effect');
		const state = !isComplete || ctx.errors !== 0;
		if (!show) {
			show = state;
		} else {
			setTimeout(() => {
				show = !isComplete || ctx.errors !== 0;
			}, 5000);
		}
	});
</script>

{#if show}
	<div
		class="flex items-center gap-3 rounded-lg bg-muted p-3"
		in:slide={{ duration: 500 }}
		out:slide={{ duration: 500 }}
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
