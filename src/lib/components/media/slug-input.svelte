<script lang="ts">
	import * as Form from '$lib/components/form';
	import { generateSlug } from '$lib/logic/slug';
	import type { MediaState } from './types';

	type Props = {
		selected: MediaState[];
		onsave: (slugs: { id: string; slug: string }[]) => Promise<void>;
	};

	let { selected, onsave }: Props = $props();

	const isSingle = $derived(selected.length === 1);

	const allSame = $derived(selected.every((s) => s.media.slug === selected[0].media.slug));

	const sanitizeSlugInput = (raw: string): string => {
		return raw
			.toLowerCase()
			.replace(/\s+/g, '-')
			.replace(/[^a-z0-9-]/g, '');
	};

	const handleInput = (e: Event) => {
		const input = e.target as HTMLInputElement;
		input.value = sanitizeSlugInput(input.value);
	};

	const info = $derived.by(() => {
		if (isSingle) return 'Changing the slug will break existing links';
		return undefined;
	});

	const handleSave = async (val: string) => {
		const slug = generateSlug(val);
		if (!slug) return;
		if (isSingle) {
			await onsave([{ id: selected[0].media.id, slug }]);
		} else {
			await onsave(selected.map((s, i) => ({ id: s.media.id, slug: `${slug}-${i + 1}` })));
		}
	};
</script>

<Form.Input
	label="Slug"
	value={allSame ? selected[0].media.slug : ''}
	placeholder={!isSingle && !allSame ? 'Different values' : 'Slug'}
	oninput={handleInput}
	{info}
	onsave={handleSave}
/>
