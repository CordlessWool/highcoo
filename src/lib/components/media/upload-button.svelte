<script lang="ts">
	import { buttonVariants, type ButtonVariant, type ButtonSize } from '$lib/components/ui/button';
	import { getUploadContext, hasUploadContext } from '$lib/components/load/upload-context.svelte';
	import { uploadFiles } from '$lib/logic/upload.svelte.js';
	import { Plus } from '@lucide/svelte';

	type Props = {
		onfiles?: (files: File[]) => void;
		variant?: ButtonVariant;
		size?: ButtonSize;
		accept?: string;
	};

	let { onfiles, variant = 'secondary', size = 'default', accept = 'image/*' }: Props = $props();

	const ctx = hasUploadContext() ? getUploadContext() : null;

	const handleChange = (event: Event) => {
		const input = event.target as HTMLInputElement;
		if (!input.files) return;
		const files = Array.from(input.files);
		onfiles?.(files);
		if (ctx) {
			uploadFiles(files, ctx);
		}
		input.value = '';
	};
</script>

<label class={buttonVariants({ variant, size })}>
	<Plus class="h-4 w-4" />
	<input type="file" multiple {accept} class="hidden" onchange={handleChange} />
</label>
