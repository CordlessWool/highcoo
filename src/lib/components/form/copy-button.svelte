<script lang="ts">
	import * as InputGroup from '$lib/components/ui/input-group';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { Copy, Check } from '@lucide/svelte';

	type Props = {
		value: string;
		disabled?: boolean;
		tooltip?: string;
	};

	let { value, disabled = false, tooltip }: Props = $props();

	let copied = $state(false);

	const copy = async () => {
		await navigator.clipboard.writeText(value);
		copied = true;
		setTimeout(() => {
			copied = false;
		}, 2000);
	};
</script>

{#if disabled && tooltip}
	<Tooltip.Provider>
		<Tooltip.Root>
			<Tooltip.Trigger>
				{#snippet child({ props: triggerProps })}
					<span {...triggerProps} class="inline-flex">
						<InputGroup.Button aria-label="Copy URL" disabled>
							<Copy />
						</InputGroup.Button>
					</span>
				{/snippet}
			</Tooltip.Trigger>
			<Tooltip.Content>{tooltip}</Tooltip.Content>
		</Tooltip.Root>
	</Tooltip.Provider>
{:else}
	<InputGroup.Button onclick={copy} aria-label="Copy URL" {disabled}>
		{#if copied}
			<Check class="text-green-500" />
		{:else}
			<Copy />
		{/if}
	</InputGroup.Button>
{/if}
