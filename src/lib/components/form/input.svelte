<script lang="ts">
	import * as InputGroup from '$lib/components/ui/input-group';
	import Indicator from './indicator.svelte';
	import { debounce, SaveStatus, getErrorMessage } from './helper';
	import type { ComponentProps } from 'svelte';

	type Props = ComponentProps<typeof InputGroup.Input> & {
		label: string;
		onsave: (value: string) => Promise<void>;
		delay?: number;
		info?: string;
	};

	let { label, onsave, delay = 500, info, oninput, ...props }: Props = $props();

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
			errorMessage = getErrorMessage(e);
		}
	}, delay);

	const handleInput = (e: Event) => {
		oninput?.(e as Event & { currentTarget: HTMLInputElement });
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
		<InputGroup.Addon align="block-start">
			<InputGroup.Label>{label}</InputGroup.Label>
			<Indicator class="ms-auto" bind:status {info} />
		</InputGroup.Addon>
		<InputGroup.Input oninput={handleInput} placeholder={label} {...props} />
	</InputGroup.Root>
	{#if status === SaveStatus.Error && errorMessage}
		<p class="text-xs text-destructive">{errorMessage}</p>
	{/if}
</div>
