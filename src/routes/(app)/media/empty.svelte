<script lang="ts">
	import * as Empty from '$lib/components/ui/empty/index.js';
	import * as Media from '$lib/components/media';
	import { ImageIcon } from '@lucide/svelte';
</script>

<Empty.Root>
	<Empty.Header>
		<Empty.Media variant="icon">
			<ImageIcon />
		</Empty.Media>
		<Empty.Title>No Media Yet</Empty.Title>
		<Empty.Description>
			You haven't uploaded any media yet. Drop files here or click the button below to upload.
		</Empty.Description>
	</Empty.Header>
	<Media.UploadButton variant="default" />
</Empty.Root>
