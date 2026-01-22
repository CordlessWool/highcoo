<script lang="ts">
	import { initUploadContext } from './upload-context.svelte';
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();

	initUploadContext();
</script>

{@render children()}
