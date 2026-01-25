<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Info } from '@lucide/svelte';
	import DetailPanel from './detail-panel.svelte';
	import type { MediaState } from './types';

	type Props = {
		selected: MediaState[];
	};

	let { selected }: Props = $props();

	let open = $state(false);
</script>

<Button variant="secondary" onclick={() => (open = true)}>
	<Info class="h-4 w-4" />
</Button>

<DetailPanel bind:open {selected} />
