<script lang="ts">
	import * as Form from '$lib/components/form';
	import { generateSlug } from '$lib/logic/slug';
	import type { Media } from '$lib/server/db/repositories/types';

	type Props = {
		selected: Media[];
		onsave: (slugs: { id: string; slug: string }[]) => Promise<void>;
	};

	let { selected, onsave }: Props = $props();

	const isSingle = $derived(selected.length === 1);

	const allSame = $derived(selected.every((s) => s.slug === selected[0].slug));

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
			await onsave([{ id: selected[0].id, slug }]);
		} else {
			await onsave(selected.map((s, i) => ({ id: s.id, slug: `${slug}-${i + 1}` })));
		}
	};
</script>

<Form.Input
	label="Slug"
	value={allSame ? selected[0].slug : ''}
	placeholder={!isSingle && !allSame ? 'Different values' : 'Slug'}
	oninput={handleInput}
	{info}
	onsave={handleSave}
/>
