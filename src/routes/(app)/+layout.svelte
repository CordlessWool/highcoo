<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { Toaster } from 'svelte-sonner';
	import { Images, LayoutDashboardIcon } from '@lucide/svelte';

	let { children } = $props();
</script>

<Toaster />
<Sidebar.Provider>
	<Sidebar.Root variant="floating">
		<Sidebar.Header>
			<span class="text-lg font-semibold">highcoo</span>
		</Sidebar.Header>
		<Sidebar.Content>
			<Sidebar.Menu>
				<Sidebar.MenuItem>
					<Sidebar.MenuButton>
						{#snippet child({ props })}
							<a href="/" {...props}>
								<LayoutDashboardIcon />
								<span>Dashboard</span>
							</a>
						{/snippet}
					</Sidebar.MenuButton>
					<Sidebar.MenuButton>
						{#snippet child({ props })}
							<a href="/media" {...props}>
								<Images />
								<span>Media</span>
							</a>
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			</Sidebar.Menu>
		</Sidebar.Content>
	</Sidebar.Root>
	{@render children?.()}
</Sidebar.Provider>
