<script lang="ts">
	import * as InputGroup from '$lib/components/ui/input-group';
	import Indicator from './indicator.svelte';
	import { debounce, SaveStatus } from './helper';
	import type { ComponentProps } from 'svelte';

	type Props = ComponentProps<typeof InputGroup.Input> & {
		label: string;
		onsave: (value: string) => Promise<void>;
		delay?: number;
		info?: string;
	};

	let { label, onsave, delay = 500, info, ...props }: Props = $props();

	let status = $state(SaveStatus.Idle);
	let errorMessage = $state('');

	const save = debounce(async (val: string) => {
		status = SaveStatus.Saving;
		errorMessage = '';
		try {
			await onsave(val);
			status = SaveStatus.Saved;
		} catch (e) {
			status = SaveStatus.Error;
			errorMessage = e instanceof Error ? e.message : 'Failed to save';
		}
	}, delay);

	const handleInput = (e: Event) => {
		const { value } = e.target as HTMLInputElement;
		if (status === SaveStatus.Error) {
			status = SaveStatus.Idle;
			errorMessage = '';
		}
		save(value);
	};
</script>

<div class="space-y-1">
	<InputGroup.Root>
		<InputGroup.Input oninput={handleInput} placeholder={label} {...props} />
		<InputGroup.Addon align="inline-end">
			<Indicator {status} />
		</InputGroup.Addon>
	</InputGroup.Root>
	{#if status === SaveStatus.Error && errorMessage}
		<p class="text-sm text-destructive">{errorMessage}</p>
	{:else if info}
		<p class="text-xs text-muted-foreground">{info}</p>
	{/if}
</div>
