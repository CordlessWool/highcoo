<script lang="ts">
	import { Input } from '$lib/components/ui/input-group';
	import type { ComponentProps } from 'svelte';

	let props: ComponentProps<typeof Input> = $props();
</script>

<Input {...props} />
