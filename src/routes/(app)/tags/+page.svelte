<script lang="ts">
	import * as Layout from '$lib/components/layout';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import * as Tag from '$lib/components/tag';
	import { getTags } from '$lib/components/tag/tags.remote';

	const tags = getTags();

	let search = $state('');
	let selectedId = $state<string | null>(null);

	const filtered = $derived(
		(tags.current ?? []).filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))
	);

	const selectedTag = $derived((tags.current ?? []).find((t) => t.id === selectedId) ?? null);
</script>

<Sidebar.Provider>
	<Sidebar.Root variant="inset">
		<Sidebar.Header class="flex flex-col gap-3">
			<Layout.NavHeader />
			<Sidebar.Input placeholder="Search tags..." bind:value={search} />
		</Sidebar.Header>
		<Sidebar.Content>
			<Sidebar.Group>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						{#each filtered as tag (tag.id)}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton
									isActive={tag.id === selectedId}
									onclick={() => {
										selectedId = tag.id;
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
		{#if selectedTag}
			<Tag.Detail tag={selectedTag} />
		{:else}
			<p class="text-muted-foreground">Select a tag to edit</p>
		{/if}
	</Sidebar.Inset>
</Sidebar.Provider>
