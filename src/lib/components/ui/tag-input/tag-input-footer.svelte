<script lang="ts">
	import * as InputGroup from '$lib/components/ui/input-group';
	import type { Snippet } from 'svelte';

	type Props = {
		count?: number;
		children?: Snippet;
	};

	let { count = 0, children }: Props = $props();
</script>

<InputGroup.Addon align="block-end" class="flex justify-end">
	<InputGroup.Text>{count} Tags</InputGroup.Text>
	{@render children?.()}
</InputGroup.Addon>
