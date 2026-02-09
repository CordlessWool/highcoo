<script lang="ts">
	import * as InputGroup from '$lib/components/ui/input-group';
	import * as Label from '$lib/components/ui/label';
	import Indicator from './indicator.svelte';
	import { SaveStatus, getErrorMessage } from './helper';
	import type { ComponentProps } from 'svelte';

	type Props = ComponentProps<typeof InputGroup.Input> & {
		label: string;
		onsave: (value: string) => Promise<void>;
		info?: string;
	};

	let { label, value = $bindable(''), onsave, oninput, info, ...props }: Props = $props();

	let status = $state(SaveStatus.Idle);
	let errorMessage = $state('');

	let dirty = $state(false);

	const handleInput = (e: Event) => {
		dirty = true;
		oninput?.(e);
		if (status === SaveStatus.Error) {
			status = SaveStatus.Idle;
			errorMessage = '';
		}
	};

	const handleSave = async () => {
		status = SaveStatus.Saving;
		errorMessage = '';
		try {
			await onsave(value);
			status = SaveStatus.Saved;
			dirty = false;
		} catch (e) {
			status = SaveStatus.Error;
			errorMessage = getErrorMessage(e);
		}
	};
</script>

<div class="space-y-1">
	<InputGroup.Root>
		<InputGroup.Addon align="block-start">
			<Label.Root class="text-foreground">{label}</Label.Root>
			{#if dirty}
				<InputGroup.Button
					class="ms-auto"
					variant="default"
					onclick={handleSave}
					disabled={status === SaveStatus.Saving}
				>
					Save
				</InputGroup.Button>
			{:else}
				<Indicator class="ms-auto" {status} />
			{/if}
		</InputGroup.Addon>
		<InputGroup.Input oninput={handleInput} placeholder={label} bind:value {...props} />
	</InputGroup.Root>
	{#if status === SaveStatus.Error && errorMessage}
		<p class="text-xs text-destructive">{errorMessage}</p>
	{:else if info}
		<p class="text-xs text-muted-foreground">{info}</p>
	{/if}
</div>
