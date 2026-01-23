<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Trash2 } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { softDeletePhotos, restorePhotos } from '$lib/api/media';
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
		const hashes = deletedItems.map((s) => s.item.photo.hash);
		const count = hashes.length;

		const success = await softDeletePhotos(hashes);

		if (!success) {
			toast.error('Failed to delete photos');
			return;
		}

		ondelete?.(deletedItems);

		toast.success(`${count} photo${count > 1 ? 's' : ''} deleted`, {
			action: {
				label: 'Undo',
				onClick: async () => {
					const restored = await restorePhotos(hashes);
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
