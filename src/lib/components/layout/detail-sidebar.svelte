<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar';
	import type { Snippet } from 'svelte';

	type Props = {
		header?: Snippet;
		children?: Snippet;
	};

	let { header, children }: Props = $props();
</script>

<Sidebar.Root side="right">
	{#if header}
		<Sidebar.Header>
			{@render header()}
		</Sidebar.Header>
	{/if}

	{#if children}
		<Sidebar.Content>
			{@render children()}
		</Sidebar.Content>
	{/if}
</Sidebar.Root>
