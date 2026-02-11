<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { ChevronDown, Images, Settings, Tags } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import LogoutItem from './logout-item.svelte';

	const routes = [
		{ href: resolve('/media'), label: 'Media', icon: Images },
		{ href: resolve('/tags'), label: 'Tags', icon: Tags },
		{ href: resolve('/settings'), label: 'Settings', icon: Settings }
	] as const;

	const current = $derived(routes.find((r) => r.href === page.url.pathname) ?? routes[0]);
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button variant="ghost" {...props}>
				<current.icon class="h-4 w-4" />
				<span>{current.label}</span>
				<ChevronDown class="h-4 w-4" />
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="start">
		{#each routes.filter((r) => r.href !== current.href) as route (route.href)}
			<DropdownMenu.Item onSelect={() => goto(route.href)}>
				<route.icon class="mr-2 h-4 w-4" />
				{route.label}
			</DropdownMenu.Item>
		{/each}
		<DropdownMenu.Separator />
		<LogoutItem />
	</DropdownMenu.Content>
</DropdownMenu.Root>
