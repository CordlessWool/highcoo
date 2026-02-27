<script lang="ts">
	import * as Form from '$lib/components/form';
	import CopyButton from '$lib/components/form/copy-button.svelte';
	import { page } from '$app/state';
	import { generateSlug } from '$lib/logic/slug';

	type Props = {
		value: string;
		isPublished: boolean;
		onsave: (slug: string) => Promise<void>;
	};

	let { value, isPublished, onsave }: Props = $props();

	const fullUrl = $derived(`${page.url.origin}/coo/${value}`);

	const sanitizeSlugInput = (raw: string): string => {
		return raw
			.toLowerCase()
			.replace(/\s+/g, '-')
			.replace(/[^a-z0-9-]/g, '');
	};

	const handleInput = (e: Event) => {
		const input = e.target as HTMLInputElement;
		const sanitized = sanitizeSlugInput(input.value);
		input.value = sanitized;
	};

	const handleSave = async (val: string) => {
		const slug = generateSlug(val);
		if (!slug) throw new Error('Slug must not be empty');
		await onsave(slug);
	};
</script>

<Form.Input
	label="Slug"
	bind:value
	placeholder="slug"
	oninput={handleInput}
	info="Changing the slug will break existing links"
	onsave={handleSave}
>
	{#snippet actions()}
		<CopyButton value={fullUrl} disabled={!isPublished} tooltip="Not yet published" />
	{/snippet}
	{#snippet hint()}
		{#if value}
			<p class="truncate px-1 text-xs text-muted-foreground">{fullUrl}</p>
		{/if}
	{/snippet}
</Form.Input>
