<script lang="ts">
	import { Loader2, Check, CircleAlert, Info } from '@lucide/svelte';
	import * as InputGroup from '$lib/components/ui/input-group';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { cn } from '$lib/utils';
	import { SaveStatus } from './helper';

	type Props = {
		status: SaveStatus;
		info?: string;
		class?: string;
	};

	let { status = $bindable(), info, class: className }: Props = $props();

	$effect(() => {
		if (status === SaveStatus.Saved) {
			const timeout = setTimeout(() => {
				status = SaveStatus.Idle;
			}, 2000);
			return () => clearTimeout(timeout);
		}
	});
</script>

{#if status === SaveStatus.Saving}
	<Loader2 class={cn('size-4 animate-spin text-muted-foreground', className)} />
{:else if status === SaveStatus.Saved}
	<Check class={cn('size-4 text-green-500', className)} />
{:else if status === SaveStatus.Error}
	<CircleAlert class={cn('size-4 text-destructive', className)} />
{:else if info}
	<Tooltip.Provider>
		<Tooltip.Root>
			<Tooltip.Trigger>
				{#snippet child({ props: triggerProps })}
					<InputGroup.Button class={className} {...triggerProps} variant="ghost" size="icon-xs">
						<Info />
					</InputGroup.Button>
				{/snippet}
			</Tooltip.Trigger>
			<Tooltip.Content>
				<p>{info}</p>
			</Tooltip.Content>
		</Tooltip.Root>
	</Tooltip.Provider>
{/if}
