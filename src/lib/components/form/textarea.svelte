<script lang="ts">
	import * as InputGroup from '$lib/components/ui/input-group';
	import Indicator from './indicator.svelte';
	import { debounce, SaveStatus } from './helper';
	import type { Component } from 'svelte';

	type Props = Omit<ComponentProps<Component<typeof InputGroup.Textarea>>, 'oninput'> & {
		label: string;
		onsave: (value: string) => Promise<void>;
		delay?: number;
	};

	let { label, onsave, delay = 500, ...props }: Props = $props();

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
		const { value } = e.target as HTMLTextAreaElement;
		if (status === SaveStatus.Error) {
			status = SaveStatus.Idle;
			errorMessage = '';
		}
		save(value);
	};
</script>

<div class="space-y-1">
	<InputGroup.Root>
		<InputGroup.Textarea oninput={handleInput} placeholder={label} {...props} />
		<InputGroup.Addon align="inline-end">
			<Indicator {status} />
		</InputGroup.Addon>
	</InputGroup.Root>
	{#if status === SaveStatus.Error && errorMessage}
		<p class="text-sm text-destructive">{errorMessage}</p>
	{/if}
</div>
