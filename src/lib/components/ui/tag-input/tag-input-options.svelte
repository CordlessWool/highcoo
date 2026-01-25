<script lang="ts">
	import * as Popover from '$lib/components/ui/popover';
	import * as Command from '$lib/components/ui/command';
	import { Plus } from '@lucide/svelte';

	type Props = {
		value?: string;
		options?: string[];
		onadd?: (tag: string) => void;
		oncreate?: (name: string) => void;
	};

	let { value = '', options = [], onadd, oncreate }: Props = $props();

	let open = $derived(!!value && value.trim().length !== 0);

	const filteredTags = $derived(
		options
			.filter((tag) => !value.includes(tag))
			.filter((tag) => tag.toLowerCase().includes(value.toLowerCase().trim()))
			.slice(0, 20)
	);

	const exactMatch = $derived(filteredTags.some((tag) => tag.toLowerCase() === value));

	const handleSelect = (tag: string) => {
		onadd?.(tag);
	};

	const handleCreate = () => {
		oncreate?.(value.trim());
	};
</script>

<Popover.Root {open}>
	<Popover.Content class="w-[200px] p-0" align="start">
		<Command.Root>
			<Command.List>
				<Command.Group>
					{#each filteredTags as tag (tag)}
						<Command.Item value={tag} onSelect={() => handleSelect(tag)}>
							{tag}
						</Command.Item>
					{/each}
					{#if !exactMatch}
						<Command.Item {value} onSelect={handleCreate}>
							<Plus class="mr-2 h-4 w-4" />
							Create "{value.trim()}"
						</Command.Item>
					{/if}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
