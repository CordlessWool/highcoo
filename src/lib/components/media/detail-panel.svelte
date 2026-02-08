<script lang="ts">
	import * as Form from '$lib/components/form';
	import MediaTagInput from './media-tag-input.svelte';
	import SlugInput from './slug-input.svelte';
	import { patchMedia } from './media.remote';
	import type { MediaState } from './types';

	type Props = {
		selected: MediaState[];
	};

	let { selected }: Props = $props();

	const isSingle = $derived(selected.length === 1);
</script>

<div class="flex flex-col gap-3 px-2">
	{#if selected.length > 0}
		<Form.Input
			label="Name"
			value={isSingle ? selected[0].media.name : ''}
			placeholder={isSingle ? 'Name' : 'Multiple items'}
			onsave={async (name) => {
				await Promise.all(selected.map((s) => patchMedia({ id: s.media.id, name })));
			}}
		/>

		<SlugInput
			{selected}
			onsave={async (slugs) => {
				await Promise.all(slugs.map(({ id, slug }) => patchMedia({ id, slug })));
			}}
		/>

		<Form.Textarea
			label="Description"
			value={isSingle ? (selected[0].media.description ?? '') : ''}
			placeholder={isSingle ? 'Description' : 'Multiple items'}
			onsave={async (description) => {
				await Promise.all(selected.map((s) => patchMedia({ id: s.media.id, description })));
			}}
		/>

		<div class="space-y-2">
			<h3 class="text-sm font-medium">Tags</h3>
			<MediaTagInput mediaIds={selected.map((s) => s.media.id)} />
		</div>
	{/if}
</div>
