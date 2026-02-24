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

	{#await getTagContent(tag.id) then content}
		{#if content}
			{@const contentId = content.id}
			<Field.Set>
				<div class="flex items-center justify-between">
					<div>
						<Field.Legend>Public Content</Field.Legend>
						<Field.Description>Visible on the public API after publishing</Field.Description>
					</div>
					{#if content.dirty}
						<Button variant="outline" size="sm" onclick={handlePublish}>
							<Send class="h-4 w-4" />
							Publish
						</Button>
					{/if}
				</div>

				<Field.Group>
					<Form.Input
						label="Title"
						value={content.title ?? ''}
						onsave={async (title) => {
							await patchTagContent({ id: contentId, tagId: tag.id, title: title || null });
						}}
					/>

					<Form.Input
						label="Slug"
						value={content.slug}
						onsave={async (slug) => {
							await patchTagContent({ id: contentId, tagId: tag.id, slug });
						}}
					/>

					<Form.Textarea
						label="Description"
						value={content.description ?? ''}
						onsave={async (description) => {
							await patchTagContent({
								id: contentId,
								tagId: tag.id,
								description: description || null
							});
						}}
					/>
				</Field.Group>
			</Field.Set>
		{:else}
			<Field.Set>
				<div>
					<Field.Legend>Public Content</Field.Legend>
					<Field.Description>Visible on the public API after publishing</Field.Description>
				</div>
				<Button variant="outline" size="sm" onclick={handleCreateContent}>
					<Plus class="h-4 w-4" />
					Add content
				</Button>
			</Field.Set>
		{/if}
	{/await}
</Field.Group>
