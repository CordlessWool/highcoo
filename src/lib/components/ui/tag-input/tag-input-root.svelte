<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import * as InputGroup from '../input-group';

	const props: ComponentProps<typeof InputGroup.Root> = $props();
</script>

<InputGroup.Root {...props} />
