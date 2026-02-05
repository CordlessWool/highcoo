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
	<ButtonGroup.Text class="border-primary bg-primary px-2 py-0.5 text-xs text-secondary"
		>{label}</ButtonGroup.Text
	>
	<Button size="icon-xs" class="text-xs" onclick={handleRemove}>
		<X />
	</Button>
</ButtonGroup.Root>
