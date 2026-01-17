<script lang="ts">
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
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
	<label class={buttonVariants({ variant: 'default' })}>
		Upload
		<input type="file" multiple accept="image/*" class="hidden" onchange={handleFiles} />
	</label>

	<!-- <Button variant="link" class="text-muted-foreground" size="sm">
		<a href="#/">
			Learn More <ArrowUpRightIcon class="inline" />
		</a>
	</Button> -->
</Empty.Root>
