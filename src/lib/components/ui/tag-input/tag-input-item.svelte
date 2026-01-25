<script lang="ts">
	import * as ButtonGroup from '$lib/components/ui/button-group';
	import { Button } from '$lib/components/ui/button';
	import { X } from '@lucide/svelte';

	type Props = {
		id: string;
		label: string;
		onremove?: (id: string) => void;
	};

	let { id, label, onremove }: Props = $props();

	const handleRemove = () => {
		onremove?.(id);
	};
</script>

<ButtonGroup.Root>
	<ButtonGroup.Text class="bg-primary text-secondary">{label}</ButtonGroup.Text>
	<Button size="icon-sm" onclick={handleRemove}>
		<X class="h-2 w-2" />
	</Button>
</ButtonGroup.Root>
