<script lang="ts">
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import { X } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import { useId } from 'bits-ui';
	import type { Snippet, ComponentProps } from 'svelte';

	type Props = ComponentProps<typeof InputGroup.Input> & {
		label?: Snippet<[string]>;
		value?: string[];
	};

	let { value = $bindable(), label, ...props }: Props = $props();
	const id = useId();

	const handleInput = (event: KeyboardEvent) => {
		event.stopPropagation();
		if (event.key === 'Enter') {
			event.preventDefault();
			const input = event.target as HTMLInputElement;
			const inputValue = input.value.trim();
			if (inputValue) {
				if (value && value.some((p: string) => p === inputValue)) {
					toast.error('Value already exists');
					return;
				}
				value = [...(value ?? []), inputValue];
				input.value = '';
			}
		}
	};

	const handleRemove = (index: number) => () => {
		value = value?.filter((_: string, i: number) => i !== index);
	};
</script>

<InputGroup.Root>
	{#if label}
		<InputGroup.Addon align="block-start">{@render label(id)}</InputGroup.Addon>
	{/if}
	<InputGroup.Addon align="block-start" class="flex flex-row flex-wrap items-center gap-1.5">
		{#each value ?? [] as pill, index (pill)}
			<div
				class="flex flex-row flex-nowrap items-center gap-2 rounded-md bg-primary px-2 py-1 text-secondary"
			>
				<span class="text-secondary">{pill}</span>
				<Button
					onclick={handleRemove(index)}
					variant="ghost"
					size="icon-sm"
					class="h-4 w-4 hover:bg-primary/10"><X /></Button
				>
			</div>
		{/each}
	</InputGroup.Addon>
	<InputGroup.Input onkeydown={handleInput} {...props} />
</InputGroup.Root>
