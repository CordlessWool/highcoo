<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';

	type Props = {
		onLoadMore: () => void;
		loading?: boolean;
		offset?: number;
	};

	let { onLoadMore, loading = false, offset = 200 }: Props = $props();

	let sentinel: HTMLElement;

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && !loading) {
					onLoadMore();
				}
			},
			{ rootMargin: `${offset}px` }
		);
		observer.observe(sentinel);
		return () => observer.disconnect();
	});
</script>

<div bind:this={sentinel} class="flex justify-center p-4">
	<Button onclick={onLoadMore} disabled={loading} variant="outline">
		{loading ? 'Loading...' : 'Load more'}
	</Button>
</div>
