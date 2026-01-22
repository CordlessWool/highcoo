<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getUploadContext } from './upload-context.svelte';
	import { uploadFiles } from '$lib/logic/upload.svelte.js';

	type Props = {
		children: Snippet<[(files: File[]) => void]>;
	};

	let { children }: Props = $props();

	const ctx = getUploadContext();

	const upload = (files: File[]) => {
		uploadFiles(files, ctx);
	};
</script>

{@render children(upload)}
