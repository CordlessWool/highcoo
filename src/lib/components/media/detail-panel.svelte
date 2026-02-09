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

	const allSame = (getter: (s: MediaState) => string | null) =>
		selected.every((s) => (getter(s) ?? '') === (getter(selected[0]) ?? ''));
</script>

<div class="flex flex-col gap-3 px-2">
	{#if selected.length > 0}
		<Form.Input
			label="Name"
			value={allSame((s) => s.media.name) ? selected[0].media.name : ''}
			placeholder={!isSingle && !allSame((s) => s.media.name) ? 'Different names' : 'Name'}
			onsave={async (val) => {
				await Promise.all(selected.map((s) => patchMedia({ id: s.media.id, name: val })));
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
			value={allSame((s) => s.media.description) ? (selected[0].media.description ?? '') : ''}
			placeholder={!isSingle && !allSame((s) => s.media.description)
				? 'Different descriptions'
				: 'Description'}
			onsave={async (val) => {
				await Promise.all(selected.map((s) => patchMedia({ id: s.media.id, description: val })));
			}}
		/>

		<MediaTagInput label="Tags" mediaIds={selected.map((s) => s.media.id)} />
	{/if}
</div>
