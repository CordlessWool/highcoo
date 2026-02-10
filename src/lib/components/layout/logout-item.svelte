<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { LogOut } from '@lucide/svelte';

	let formRef = $state<HTMLFormElement | null>(null);
</script>

<form method="POST" action="/auth/logout" bind:this={formRef} class="hidden"></form>
<DropdownMenu.Item onSelect={() => formRef?.requestSubmit()}>
	<LogOut class="mr-2 h-4 w-4" />
	Log out
</DropdownMenu.Item>
