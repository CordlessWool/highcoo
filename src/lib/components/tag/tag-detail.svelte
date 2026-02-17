<script lang="ts">
	import * as Form from '$lib/components/form';
	import * as Field from '$lib/components/ui/field';
	import { Button } from '$lib/components/ui/button';
	import { Send, Plus } from '@lucide/svelte';
	import {
		patchTag,
		getTagContent,
		createTagContent,
		patchTagContent,
		publishTagContent
	} from './tags.remote';
	import { generateSlug } from '$lib/logic/slug';
	import type { Tag } from '$lib/logic/tag';

	type Props = {
		tag: Tag;
	};

	let { tag }: Props = $props();

	const content = $derived(await getTagContent(tag.id));

	const handleCreateContent = async () => {
		await createTagContent({
			tagId: tag.id,
			slug: generateSlug(tag.name)
		});
		await getTagContent(tag.id).refresh();
	};

	const handlePublish = async () => {
		await publishTagContent(tag.id);
		await getTagContent(tag.id).refresh();
	};
</script>

<Field.Group>
	<Field.Set>
		<Field.Group>
			<Form.Input
				label="Name"
				value={tag.name}
				onsave={async (name) => {
					await patchTag({ id: tag.id, name });
				}}
			/>

			<Form.ColorInput
				value={tag.color ?? ''}
				onsave={async (color) => {
					await patchTag({ id: tag.id, color: color || null });
				}}
			/>
		</Field.Group>
	</Field.Set>

	<Field.Separator />

	<Field.Set>
		<div class="flex items-center justify-between">
			<div>
				<Field.Legend>Public Content</Field.Legend>
				<Field.Description>Visible on the public API after publishing</Field.Description>
			</div>
			{#if content?.dirty}
				<Button variant="outline" size="sm" onclick={handlePublish}>
					<Send class="h-4 w-4" />
					Publish
				</Button>
			{/if}
		</div>

		<Field.Group>
			{#if content}
				<Form.Input
					label="Title"
					value={content.title ?? ''}
					onsave={async (title) => {
						await patchTagContent({ id: content.id, tagId: tag.id, title: title || null });
					}}
				/>

				<Form.Input
					label="Slug"
					value={content.slug}
					onsave={async (slug) => {
						await patchTagContent({ id: content.id, tagId: tag.id, slug });
					}}
				/>

				<Form.Textarea
					label="Description"
					value={content.description ?? ''}
					onsave={async (description) => {
						await patchTagContent({
							id: content.id,
							tagId: tag.id,
							description: description || null
						});
					}}
				/>
			{:else}
				<Button variant="outline" size="sm" onclick={handleCreateContent}>
					<Plus class="h-4 w-4" />
					Add content
				</Button>
			{/if}
		</Field.Group>
	</Field.Set>
</Field.Group>
