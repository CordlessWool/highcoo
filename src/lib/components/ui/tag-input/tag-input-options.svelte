<script lang="ts">
	import * as Popover from '$lib/components/ui/popover';
	import * as Command from '$lib/components/ui/command';
	import * as InputGroup from '$lib/components/ui/input-group';
	import { Plus } from '@lucide/svelte';

	type Option = { id: string; label: string };

	type Props = {
		class?: string;
		options?: Option[];
		onadd?: (option: Option) => void;
		oncreate?: (name: string) => void;
		onsearch?: (search: string) => Option[] | Promise<Option[]>;
	};

	let { class: className, options = [], onadd, oncreate, onsearch }: Props = $props();

	let value = $state('');
	let searchResult = $state<Option[]>([]);

	$effect(() => {
		const trimmed = value.trim();
		if (onsearch) {
			Promise.resolve(onsearch(trimmed)).then((r) => (searchResult = r));
		} else {
			searchResult = trimmed
				? options.filter((o) => o.label.toLowerCase().includes(trimmed.toLowerCase()))
				: options;
		}
	});

	const exactMatch = $derived(
		searchResult.some((o) => o.label.toLowerCase() === value.trim().toLowerCase())
	);

	const handleSelect = (option: Option) => {
		onadd?.(option);
		value = '';
	};

	const handleCreate = () => {
		oncreate?.(value.trim());
		value = '';
	};
</script>

<Popover.Root>
	<Popover.Trigger class={className}>
		<InputGroup.Button variant="ghost" size="icon-xs">
			<Plus />
		</InputGroup.Button>
	</Popover.Trigger>
	<Popover.Content class="w-[--radix-popover-trigger-width] p-0" align="start">
		<Command.Root shouldFilter={false}>
			<Command.Input bind:value placeholder="Search or create..." />
			<Command.List>
				<Command.Empty>No tags found.</Command.Empty>
				<Command.Group>
					{#each searchResult as option (option.id)}
						<Command.Item value={option.id} onSelect={() => handleSelect(option)}>
							{option.label}
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
