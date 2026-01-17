<script lang="ts">
	import * as Layout from '$lib/components/layout';
	import { Button } from '$lib/components/ui/button';
	import * as ButtonGroup from '$lib/components/ui/button-group/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import type { PageProps } from './$types';
	import Empty from './empty.svelte';

	const { data }: PageProps = $props();
</script>

<main class="flex min-h-screen w-full p-2">
	<ButtonGroup.Root>
		<ButtonGroup.Root>
			<Layout.SidebarTriggerButton variant="secondary" />
		</ButtonGroup.Root>
	</ButtonGroup.Root>

	{#if data.pagination.total === 0}
		<div class="grid min-h-0 flex-1 place-items-center">
			<Empty />
		</div>
	{:else}
		<div class="grid grid-cols-2 gap-4">
			{#each data.photos as photo (photo.id)}
				<div class="aspect-w-1 aspect-h-1 rounded-lg bg-gray-200"></div>
			{/each}
		</div>
	{/if}
</main>
