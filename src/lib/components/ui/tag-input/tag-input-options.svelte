<script lang="ts">
	import * as Popover from '$lib/components/ui/popover';
	import * as Command from '$lib/components/ui/command';
	import * as InputGroup from '$lib/components/ui/input-group';
	import { Plus } from '@lucide/svelte';

	type Props = {
		class?: string;
		options?: string[];
		onadd?: (tag: string) => void;
		oncreate?: (name: string) => void;
	};

	let { class: className, options = [], onadd, oncreate }: Props = $props();

	let value = $state('');

	// Filter by search value
	const tags = $derived(
		value.trim()
			? options.filter((tag) => tag.toLowerCase().includes(value.toLowerCase().trim()))
			: options
	);

	const exactMatch = $derived(tags.some((tag) => tag.toLowerCase() === value.trim().toLowerCase()));

	const handleSelect = (tag: string) => {
		onadd?.(tag);
		value = '';
	};

	const handleCreate = () => {
		oncreate?.(value.trim());
		value = '';
	};
</script>

<Popover.Root>
	<Popover.Trigger class={className}>
		<InputGroup.Button variant="default">
			<Plus />
		</InputGroup.Button>
	</Popover.Trigger>
	<Popover.Content class="w-[--radix-popover-trigger-width] p-0" align="start">
		<Command.Root shouldFilter={false}>
			<Command.Input bind:value placeholder="Search or create..." />
			<Command.List>
				<Command.Empty>No tags found.</Command.Empty>
				<Command.Group>
					{#each tags as tag (tag)}
						<Command.Item value={tag} onSelect={() => handleSelect(tag)}>
							{tag}
						</Command.Item>
					{/each}
					{#if value.trim() && !exactMatch}
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
