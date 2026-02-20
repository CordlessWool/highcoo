<script lang="ts">
	import * as InputGroup from '$lib/components/ui/input-group';
	import { Search } from '@lucide/svelte';
	import { debounce } from '$lib/components/form/helper';

	type Props = {
		placeholder?: string;
		delay?: number;
		class?: string;
		onsearch: (value: string) => void;
	};

	let { placeholder = 'Search…', delay = 300, class: className, onsearch }: Props = $props();

	let value = $state('');

	const search = $derived(debounce((val: string) => onsearch(val), delay));

	function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
		value = e.currentTarget.value;
		search(value);
	}
</script>

<InputGroup.Root class={className}>
	<InputGroup.Addon align="inline-start">
		<Search />
	</InputGroup.Addon>
	<InputGroup.Input {value} oninput={handleInput} {placeholder} />
</InputGroup.Root>
