<script lang="ts">
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { UploadButton } from '$lib/components/media';
	import { ImageIcon } from '@lucide/svelte';
</script>

<Empty.Root>
	<Empty.Header>
		<Empty.Media variant="icon">
			<ImageIcon />
		</Empty.Media>
		<Empty.Title>No Photos Yet</Empty.Title>
		<Empty.Description>
			You haven't uploaded any images yet. Drop images here or click the button below to upload.
		</Empty.Description>
	</Empty.Header>
	<UploadButton variant="default" />
</Empty.Root>
