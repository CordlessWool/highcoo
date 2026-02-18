<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Field from '$lib/components/ui/field';
	import * as Form from '$lib/components/form';
	import * as InputGroup from '$lib/components/ui/input-group';
	import { Button } from '$lib/components/ui/button';
	import { createTag } from './tags.remote';
	import type { Tag } from '$lib/logic/tag';

	type Props = {
		oncreate: (tag: Tag) => void;
		oncancel: () => void;
	};

	let { oncreate, oncancel }: Props = $props();

	let name = $state('');
	let color = $state('');
	let saving = $state(false);

	const canCreate = $derived(name.trim().length > 0);

	const handleSubmit = async (e: Event) => {
		e.preventDefault();
		if (!canCreate) return;
		saving = true;
		try {
			const tag = await createTag({ name: name.trim(), color: color || undefined });
			oncreate(tag);
		} finally {
			saving = false;
		}
	};
</script>

<Card.Root class="col-span-1 row-span-3 sm:col-span-2">
	<form onsubmit={handleSubmit} class="flex h-full flex-col">
		<Card.Content class="flex-1">
			<Field.Group>
				<Field.Set>
					<Field.Legend>Create Tag</Field.Legend>
					<Field.Description>Create a new tag by pressing create button</Field.Description>
					<Field.Group>
						<InputGroup.Root>
							<InputGroup.Addon align="block-start">
								<InputGroup.Label>Name</InputGroup.Label>
							</InputGroup.Addon>
							<InputGroup.Input bind:value={name} placeholder="Name" autofocus />
						</InputGroup.Root>
						<Form.ColorInput bind:value={color} />
					</Field.Group>
				</Field.Set>
			</Field.Group>
		</Card.Content>
		<Card.Footer class="flex gap-2">
			<Button type="submit" disabled={!canCreate || saving}>Create</Button>
			<Button type="button" variant="outline" onclick={oncancel}>Cancel</Button>
		</Card.Footer>
	</form>
</Card.Root>
