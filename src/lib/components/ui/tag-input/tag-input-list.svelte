<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import * as InputGroup from '../input-group';
	import { cn } from '$lib/utils';
	type Props = ComponentProps<typeof InputGroup.Addon> & {
		class?: string;
	};

	let { children, ...props }: Props = $props();

	let mergedProps = $derived({
		...props,
		class: cn('flex flex-row flex-wrap w-full items-start justify-start gap-1.5', props.class)
	});
</script>

<InputGroup.Addon align="block-start" {...mergedProps}>
	{@render children?.()}
</InputGroup.Addon>
