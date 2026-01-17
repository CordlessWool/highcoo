<script lang="ts">
	import { useSidebar } from '$lib/components/ui/sidebar/index.js';
	import { PanelLeft } from '@lucide/svelte';
	import { Button } from '../ui/button';
	import type { ComponentProps } from 'svelte';
	const sidebar = useSidebar();

	const props: ComponentProps<typeof Button> = $props();
</script>

<Button {...props} onclick={() => sidebar.toggle()}><PanelLeft /></Button>
