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

	type Props = {
		id: string;
		onclose: () => void;
		ondelete?: (ids: string[]) => void;
		onrestore?: (ids: string[]) => void;
	};

	let { id, onclose, ondelete, onrestore }: Props = $props();

	const media = $derived(await getMedia(id));
	const src = $derived(media ? resolve('/(app)/file/[hash]', { hash: media.fileHash }) : null);

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
	<!-- Image -->
	<div
		class="flex h-48 shrink-0 flex-col bg-muted md:h-auto"
		class:md:h-[55%]={isHorizontal}
		class:md:w-[60%]={!isHorizontal}
	>
		{#if src}
			<img
				src="{src}?w=900"
				alt={media?.name ?? ''}
				class="min-h-0 w-full flex-1 object-cover"
				onload={onImageLoad}
			/>
		{/if}
	</div>

	<!-- Divider -->
	<div class="shrink-0 bg-border" class:h-px={isHorizontal} class:w-px={!isHorizontal}></div>

	<!-- Form panel -->
	<div class="flex min-w-0 flex-1 flex-col bg-card">
		<Card.Root class="flex h-full flex-col rounded-none border-0 shadow-none">
			<Card.Header class="flex flex-row items-center justify-between gap-2">
				{#if media?.dirty}
					<Button variant="outline" size="sm" onclick={() => publishMedia([id])}>
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
						value={media?.name ?? ''}
						placeholder="Name"
						onsave={async (val) => {
							await patchMedia({ id, name: val });
						}}
					/>

					{#if media}
						<SlugInput
							selected={[media]}
							onsave={async (slugs) => {
								await Promise.all(slugs.map(({ id: sid, slug }) => patchMedia({ id: sid, slug })));
							}}
						/>
					{/if}

					<Form.Textarea
						label="Description"
						value={media?.description ?? ''}
						placeholder="Description"
						onsave={async (val) => {
							await patchMedia({ id, description: val });
						}}
					/>

					<MediaTagInput label="Tags" mediaIds={[id]} />
				</div>
			</Card.Content>
			<Card.Footer class="justify-end">
				<DeleteButton
					selected={[id]}
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
