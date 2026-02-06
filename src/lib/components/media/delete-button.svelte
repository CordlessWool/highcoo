<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Trash2 } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { softDeleteMedia, restoreMedia } from '$lib/api/media';
	import type { MediaState } from './types';

	type Props = {
		selected: MediaState[];
		ondelete?: (ids: string[]) => void;
		onrestore?: (ids: string[]) => void;
	};

	let { selected, ondelete, onrestore }: Props = $props();

	const handleDelete = async () => {
		const ids = selected.map((s) => s.media.id);
		const count = ids.length;

		const success = await softDeleteMedia(ids);

		if (!success) {
			toast.error('Failed to delete media');
			return;
		}

		ondelete?.(ids);

		toast.success(`${count} item${count > 1 ? 's' : ''} deleted`, {
			action: {
				label: 'Undo',
				onClick: async () => {
					const restored = await restoreMedia(ids);
					if (restored) {
						onrestore?.(ids);
					}
				}
			}
		});
	};
</script>

<Button variant="destructive" onclick={handleDelete}>
	<Trash2 />
	Delete ({selected.length})
</Button>
