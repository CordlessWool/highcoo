<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import type { TagWithStatus } from '$lib/logic/tag';

	type Props = {
		tag: TagWithStatus;
		onclick: () => void;
	};

	let { tag, onclick }: Props = $props();

	const hasContent = $derived(tag.hasDraft || tag.isPublished);
</script>

<button class="row-span-1 grid h-full w-full items-stretch text-left" {onclick}>
	<Card.Root class="relative">
		{#if tag.isDirty}
			<span
				class="absolute top-1.5 right-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-orange-500 dark:border-background"
				title="Unpublished changes"
			></span>
		{/if}
		<Card.Content class="flex flex-col gap-3">
			<Card.Title class="text-base">{tag.name}</Card.Title>
			<div class="flex items-center gap-1.5">
				<span class="size-3 rounded-full border" style:background-color={tag.color ?? '#ffffff'}
				></span>
				<span class="font-mono text-xs text-muted-foreground">{tag.color ?? '#ffffff'}</span>
			</div>
		</Card.Content>
		<Card.Footer>
			<div class="flex flex-wrap items-center gap-2">
				{#if hasContent}
					<Badge variant="outline" class="text-xs">Content</Badge>
				{/if}
				{#if tag.isPublished}
					<Badge variant="default" class="text-xs">Published</Badge>
				{/if}
			</div>
		</Card.Footer>
	</Card.Root>
</button>
