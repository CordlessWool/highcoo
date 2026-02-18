<script lang="ts">
	import * as Layout from '$lib/components/layout';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import * as Tag from '$lib/components/tag';
	import { getTags } from '$lib/components/tag/tags.remote';
	import { Plus } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';

	const tags = getTags();

	let search = $state('');
	let selectedId = $state<string | null>(null);
	let creating = $state(false);

	const filtered = $derived(
		(tags.current ?? []).filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))
	);

	const selectedTag = $derived((tags.current ?? []).find((t) => t.id === selectedId) ?? null);

	const handleCreate = () => {
		selectedId = null;
		creating = true;
	};

	const handleCreated = (tag: { id: string }) => {
		selectedId = tag.id;
		creating = false;
	};

	const handleCancel = () => {
		creating = false;
	};
</script>

<Sidebar.Provider>
	<Sidebar.Root variant="inset">
		<Sidebar.Header class="flex flex-col gap-3">
			<Layout.NavHeader />
			<Button variant="outline" class="w-full" onclick={handleCreate}>
				<Plus class="h-4 w-4" />
				Create Tag
			</Button>
			<Sidebar.Input placeholder="Search tags..." bind:value={search} />
		</Sidebar.Header>
		<Sidebar.Content>
			<Sidebar.Group>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						{#each filtered as tag (tag.id)}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton
									isActive={!creating && tag.id === selectedId}
									onclick={() => {
										selectedId = tag.id;
										creating = false;
									}}
								>
									{tag.name}
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						{/each}
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		</Sidebar.Content>
	</Sidebar.Root>
	<Sidebar.Inset class="p-6">
		{#if creating}
			<Tag.CreateForm oncreate={handleCreated} oncancel={handleCancel} />
		{:else if selectedTag}
			<Tag.Detail tag={selectedTag} />
		{:else}
			<p class="text-muted-foreground">Select a tag to edit</p>
		{/if}
	</Sidebar.Inset>
</Sidebar.Provider>
