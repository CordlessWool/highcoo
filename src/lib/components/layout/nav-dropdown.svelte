<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { ChevronDown, LayoutDashboard, Images } from '@lucide/svelte';
	import { page } from '$app/state';

	const routes = [
		{ href: '/', label: 'Dashboard', icon: LayoutDashboard },
		{ href: '/media', label: 'Media', icon: Images }
	];

	const current = $derived(routes.find((r) => r.href === page.url.pathname) ?? routes[0]);
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button variant="secondary" {...props}>
				<current.icon class="h-4 w-4" />
				<span>{current.label}</span>
				<ChevronDown class="h-4 w-4" />
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="start">
		{#each routes.filter((r) => r.href !== current.href) as route}
			<DropdownMenu.Item href={route.href}>
				<route.icon class="mr-2 h-4 w-4" />
				{route.label}
			</DropdownMenu.Item>
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
