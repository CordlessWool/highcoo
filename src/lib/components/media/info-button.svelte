<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Info } from '@lucide/svelte';

	type Props = {
		open: boolean;
	};

	let { open = $bindable() }: Props = $props();
</script>

<Button variant="secondary" onclick={() => (open = !open)}>
	<Info class="h-4 w-4" />
</Button>
