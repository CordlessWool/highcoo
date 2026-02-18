<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { X } from '@lucide/svelte';
	import Detail from './tag-detail.svelte';
	import type { TagWithStatus } from '$lib/logic/tag';

	type Props = {
		tag: TagWithStatus;
		onclose: () => void;
	};

	let { tag, onclose }: Props = $props();

	const hasContent = $derived(tag.hasDraft || tag.isPublished);
	const cardClass = $derived(
		hasContent ? 'col-span-1 row-span-5 sm:col-span-2' : 'col-span-1 row-span-3 sm:col-span-2'
	);
</script>

<Card.Root class={cardClass}>
	<Card.Header class="flex flex-row items-center justify-between">
		<Card.Title class="text-base">{tag.name}</Card.Title>
		<Button variant="ghost" size="icon-xs" onclick={onclose} aria-label="Close">
			<X class="h-4 w-4" />
		</Button>
	</Card.Header>
	<Card.Content class="overflow-y-auto">
		<Detail {tag} />
	</Card.Content>
</Card.Root>
