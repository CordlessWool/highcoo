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

	let value = $derived(isSingle ? selected[0].media.slug : '');

	const sanitizeSlugInput = (raw: string): string => {
		return raw
			.toLowerCase()
			.replace(/\s+/g, '-')
			.replace(/[^a-z0-9-]/g, '');
	};

	const handleInput = (e: Event) => {
		const input = e.target as HTMLInputElement;
		const sanitized = sanitizeSlugInput(input.value);
		value = sanitized;
		input.value = sanitized;
	};

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

<Form.ManualInput
	label="Slug"
	bind:value
	oninput={handleInput}
	placeholder={isSingle ? 'Slug' : 'Change all slugs'}
	info="Changing slugs will break existing links"
	onsave={handleSave}
/>
