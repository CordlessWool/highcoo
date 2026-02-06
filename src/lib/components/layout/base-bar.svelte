<script lang="ts">
	import type { Snippet } from 'svelte';
	import NavDropdown from './nav-dropdown.svelte';

	type Props = {
		children?: Snippet;
	};

	let { children }: Props = $props();
</script>

<header class="flex items-center gap-3 p-3">
	<img src="/logo.svg" alt="Logo" class="h-10" />
	<NavDropdown />
	<div class="ml-7 flex items-center gap-3">
		{@render children?.()}
	</div>
</header>
