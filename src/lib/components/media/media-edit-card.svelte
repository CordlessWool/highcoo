<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Form from '$lib/components/form';
	import { Button } from '$lib/components/ui/button';
	import { X, Send } from '@lucide/svelte';
	import DeleteButton from './delete-button.svelte';
	import { resolve } from '$app/paths';
	import SlugInput from './slug-input.svelte';
	import MediaTagInput from './media-tag-input.svelte';
	import { patchMedia, getMedia, publishMedia } from './media.remote';
	import type { Media } from '$lib/server/db/repositories/types';

	type Props = {
		selectedIds: string[];
		onclose: () => void;
		ondelete?: (ids: string[]) => void;
		onrestore?: (ids: string[]) => void;
	};

	let { selectedIds, onclose, ondelete, onrestore }: Props = $props();

	const restIds = $derived(selectedIds.slice(1));

	// Reactive per-item fetch — updates when getMedia cache changes via .set()
	const items = $derived(
		(await Promise.all(selectedIds.map((id) => getMedia(id)))).filter((m): m is Media => m !== null)
	);

	const primaryMedia = $derived(items[0] ?? null);
	const primarySrc = $derived(
		primaryMedia ? resolve('/(app)/file/[hash]', { hash: primaryMedia.fileHash }) : null
	);
	const nameSame = $derived(items.every((m) => m.name === items[0]?.name));
	const descSame = $derived(
		items.every((m) => (m.description ?? '') === (items[0]?.description ?? ''))
	);
	const anyDirty = $derived(items.some((m) => m.dirty));

	let isHorizontal = $state(false);

	function onImageLoad(e: Event) {
		const img = e.target as HTMLImageElement;
		isHorizontal = img.naturalWidth > img.naturalHeight;
	}
</script>

<div
	class="col-span-1 row-span-1 flex overflow-x-hidden rounded-xl shadow-lg ring-1 ring-black/5 sm:col-span-2 sm:row-span-2 md:col-span-3 md:row-span-3 dark:ring-white/10"
	class:md:flex-col={isHorizontal}
	class:md:flex-row={!isHorizontal}
	class:flex-col={true}
>
	<!-- Image + thumbnails -->
	<div
		class="flex h-48 shrink-0 flex-col bg-muted md:h-auto"
		class:md:h-[55%]={isHorizontal}
		class:md:w-[60%]={!isHorizontal}
	>
		{#if primarySrc}
			<img
				src="{primarySrc}?w=900"
				alt={primaryMedia?.name ?? ''}
				class="min-h-0 flex-1 object-cover"
				class:w-full={true}
				onload={onImageLoad}
			/>
		{/if}
		{#if restIds.length > 0}
			<div class="grid" class:grid-cols-7={isHorizontal} class:grid-cols-5={!isHorizontal}>
				{#each restIds as id (id)}
					{@const thumbMedia = items.find((m) => m.id === id)}
					{#if thumbMedia}
						{@const thumbSrc = resolve('/(app)/file/[hash]', { hash: thumbMedia.fileHash })}
						<img
							src="{thumbSrc}?w=160"
							alt={thumbMedia.name}
							class="aspect-square w-full object-cover ring-2 ring-primary"
						/>
					{/if}
				{/each}
			</div>
		{/if}
	</div>

	<!-- Divider -->
	<div class="shrink-0 bg-border" class:h-px={isHorizontal} class:w-px={!isHorizontal}></div>

	<!-- Form panel -->
	<div class="flex min-w-0 flex-1 flex-col bg-card">
		<Card.Root class="flex h-full flex-col rounded-none border-0 shadow-none">
			<Card.Header class="flex flex-row items-center justify-between gap-2">
				{#if anyDirty}
					<Button variant="outline" size="sm" onclick={() => publishMedia(selectedIds)}>
						<Send class="h-4 w-4" />
						Publish
					</Button>
				{:else}
					<span></span>
				{/if}
				<Button variant="ghost" size="icon-sm" onclick={onclose} aria-label="Close">
					<X />
				</Button>
			</Card.Header>

			<Card.Content class="flex flex-1 flex-col overflow-y-auto">
				<div class={isHorizontal ? 'grid grid-cols-1 gap-4 md:grid-cols-2' : 'flex flex-col gap-4'}>
					<Form.Input
						label="Name"
						value={nameSame ? (items[0]?.name ?? '') : ''}
						placeholder={!nameSame ? 'Different names' : 'Name'}
						onsave={async (val) => {
							await Promise.all(items.map((m) => patchMedia({ id: m.id, name: val })));
						}}
					/>

					<SlugInput
						selected={items}
						onsave={async (slugs) => {
							await Promise.all(slugs.map(({ id, slug }) => patchMedia({ id, slug })));
						}}
					/>

					<Form.Textarea
						label="Description"
						value={descSame ? (items[0]?.description ?? '') : ''}
						placeholder={!descSame ? 'Different descriptions' : 'Description'}
						onsave={async (val) => {
							await Promise.all(items.map((m) => patchMedia({ id: m.id, description: val })));
						}}
					/>

					<MediaTagInput label="Tags" mediaIds={items.map((m) => m.id)} />
				</div>
			</Card.Content>
			<Card.Footer class="justify-end">
				<DeleteButton
					selected={selectedIds}
					ondelete={(ids) => {
						ondelete?.(ids);
						onclose();
					}}
					onrestore={(ids) => {
						onrestore?.(ids);
					}}
				/>
			</Card.Footer>
		</Card.Root>
	</div>
</div>
