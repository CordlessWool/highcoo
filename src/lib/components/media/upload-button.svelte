<script lang="ts">
	import { buttonVariants, type ButtonVariant } from '$lib/components/ui/button';
	import { Plus } from '@lucide/svelte';

	type Props = {
		onfiles: (files: File[]) => void;
		variant?: ButtonVariant;
		accept?: string;
	};

	let { onfiles, variant = 'secondary', accept = 'image/*' }: Props = $props();

	const handleChange = (event: Event) => {
		const input = event.target as HTMLInputElement;
		if (!input.files) return;
		onfiles(Array.from(input.files));
		input.value = '';
	};
</script>

<label class={buttonVariants({ variant })}>
	<Plus class="h-4 w-4" />
	<input type="file" multiple {accept} class="hidden" onchange={handleChange} />
</label>
