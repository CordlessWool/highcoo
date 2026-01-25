<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Trash2 } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { softDeleteMedia, restoreMedia } from '$lib/api/media';
	import type { DeletedItem } from './types';

	type Props = {
		selected: DeletedItem[];
		ondelete?: (items: DeletedItem[]) => void;
		onrestore?: (items: DeletedItem[]) => void;
	};

	let { selected, ondelete, onrestore }: Props = $props();

	const handleDelete = async () => {
		// Capture items before delete - selected will be empty after ondelete
		const deletedItems = [...selected];
		const hashes = deletedItems.map((s) => s.item.media.hash);
		const count = hashes.length;

		const success = await softDeleteMedia(hashes);

		if (!success) {
			toast.error('Failed to delete media');
			return;
		}

		ondelete?.(deletedItems);

		toast.success(`${count} item${count > 1 ? 's' : ''} deleted`, {
			action: {
				label: 'Undo',
				onClick: async () => {
					const restored = await restoreMedia(hashes);
					if (restored) {
						onrestore?.(deletedItems);
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
