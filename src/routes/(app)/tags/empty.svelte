<script lang="ts">
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { Tag } from '@lucide/svelte';
</script>

<Empty.Root>
	<Empty.Header>
		<Empty.Media variant="icon">
			<Tag />
		</Empty.Media>
		<Empty.Title>No Tags Yet</Empty.Title>
		<Empty.Description>
			You haven't created any tags yet. Click the button above to create your first tag.
		</Empty.Description>
	</Empty.Header>
</Empty.Root>
