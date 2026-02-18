<script lang="ts">
	import * as Layout from '$lib/components/layout';
	import * as Tag from '$lib/components/tag';
	import * as ButtonGroup from '$lib/components/ui/button-group';
	import { getTags } from '$lib/components/tag/tags.remote';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Plus } from '@lucide/svelte';
	import type { Tag as TagType } from '$lib/logic/tag';

	let search = $state('');
	let expandedId = $state<string | null>(null);
	let creating = $state(false);

	const tags = $derived(getTags({ search: search || undefined }));
	const filtered = $derived(tags.current ?? []);

	const handleCreate = () => {
		expandedId = null;
		creating = true;
	};

	const handleCreated = (tag: TagType) => {
		creating = false;
		// switch to view, not edit
	};

	const handleCancel = () => {
		creating = false;
	};

	const handleEdit = (id: string) => {
		expandedId = id;
		creating = false;
	};

	const handleClose = () => {
		expandedId = null;
	};
</script>

<main class="flex min-h-screen w-full flex-col gap-2">
	<Layout.BaseBar>
		<ButtonGroup.Root>
			<Button variant="outline" size="sm" onclick={handleCreate}>
				<Plus class="h-4 w-4" />
				Create Tag
			</Button>
		</ButtonGroup.Root>
		<Input placeholder="Search tags..." bind:value={search} class="max-w-xs" />
	</Layout.BaseBar>

	<div
		class="grid auto-rows-[10rem] grid-cols-1 gap-4 p-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
	>
		{#if creating}
			<Tag.CreateCard oncreate={handleCreated} oncancel={handleCancel} />
		{/if}

		{#each filtered as tag (tag.id)}
			{#if tag.id === expandedId}
				<Tag.EditCard {tag} onclose={handleClose} />
			{:else}
				<Tag.ViewCard {tag} onclick={() => handleEdit(tag.id)} />
			{/if}
		{/each}
	</div>
</main>
