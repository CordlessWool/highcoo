<script lang="ts">
	import * as InputGroup from '$lib/components/ui/input-group';
	import { Search } from '@lucide/svelte';
	import { debounce } from '$lib/components/form/helper';

	type Props = {
		placeholder?: string;
		delay?: number;
		class?: string;
		value?: string;
		onsearch: (value: string) => void;
	};

	let { placeholder = 'Search…', delay = 300, class: className, value = '', onsearch }: Props =
		$props();

	const search = $derived(debounce((val: string) => onsearch(val), delay));

	function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
		search(e.currentTarget.value);
	}
</script>

<InputGroup.Root class={className}>
	<InputGroup.Addon align="inline-start">
		<Search />
	</InputGroup.Addon>
	<InputGroup.Input {value} oninput={handleInput} {placeholder} />
</InputGroup.Root>
