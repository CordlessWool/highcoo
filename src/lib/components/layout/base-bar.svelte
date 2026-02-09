<script lang="ts">
	import type { Snippet } from 'svelte';
	import NavHeader from './nav-header.svelte';

	type Props = {
		children?: Snippet;
	};

	let { children }: Props = $props();
</script>

<header class="flex items-center gap-3 p-3">
	<NavHeader />
	<div class="ml-7 flex items-center gap-3">
		{@render children?.()}
	</div>
</header>
