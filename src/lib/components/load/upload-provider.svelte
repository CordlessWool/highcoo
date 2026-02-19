<script lang="ts">
	import { initUploadContext } from './upload-context.svelte';
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
		oncomplete?: () => void;
	};

	let { children, oncomplete }: Props = $props();

	const ctx = initUploadContext();

	$effect(() => {
		if (ctx.total > 0 && ctx.completed === ctx.total && ctx.errors === 0) {
			oncomplete?.();
		}
	});
</script>

{@render children()}
