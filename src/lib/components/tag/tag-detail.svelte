<script lang="ts">
	import * as Form from '$lib/components/form';
	import { patchTag } from './tags.remote';
	import type { Tag } from '$lib/logic/tag';

	type Props = {
		tag: Tag;
	};

	let { tag }: Props = $props();
</script>

<div class="flex flex-col gap-3">
	<Form.Input
		label="Name"
		value={tag.name}
		onsave={async (name) => {
			await patchTag({ id: tag.id, name });
		}}
	/>

	<Form.Input
		label="Color"
		value={tag.color ?? ''}
		onsave={async (color) => {
			await patchTag({ id: tag.id, color: color || null });
		}}
	/>

	<Form.Textarea
		label="Description"
		value={tag.description ?? ''}
		onsave={async (description) => {
			await patchTag({ id: tag.id, description: description || null });
		}}
	/>
</div>
