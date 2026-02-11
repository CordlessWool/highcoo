<script lang="ts">
	import * as InputGroup from '$lib/components/ui/input-group';
	import Indicator from './indicator.svelte';
	import { SaveStatus, getErrorMessage } from './helper';

	type Option = { value: string; label: string };

	type Props = {
		label: string;
		value: string;
		options: Option[];
		onsave: (value: string) => Promise<void>;
		info?: string;
	};

	let { label, value = $bindable(''), options, onsave, info }: Props = $props();

	let status = $state(SaveStatus.Idle);
	let errorMessage = $state('');

	const handleChange = async (e: Event) => {
		const selected = (e.target as HTMLSelectElement).value;
		status = SaveStatus.Saving;
		errorMessage = '';
		try {
			await onsave(selected);
			status = SaveStatus.Saved;
		} catch (e) {
			status = SaveStatus.Error;
			errorMessage = getErrorMessage(e);
		}
	};
</script>

<div class="space-y-1">
	<InputGroup.Root>
		<InputGroup.Addon align="block-start">
			<InputGroup.Label>{label}</InputGroup.Label>
			<Indicator class="ms-auto" bind:status {info} />
		</InputGroup.Addon>
		<InputGroup.Select bind:value onchange={handleChange}>
			{#each options as opt (opt.value)}
				<option value={opt.value}>{opt.label}</option>
			{/each}
		</InputGroup.Select>
	</InputGroup.Root>
	{#if status === SaveStatus.Error && errorMessage}
		<p class="text-xs text-destructive">{errorMessage}</p>
	{/if}
</div>
