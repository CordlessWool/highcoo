<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Trash2 } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { softDeleteMedia, restoreMedia } from '$lib/api/media';
	import type { MediaState } from './types';

	type Props = {
		selected: MediaState[];
		ondelete?: (hashes: string[]) => void;
		onrestore?: (hashes: string[]) => void;
	};

	let { selected, ondelete, onrestore }: Props = $props();

	const handleDelete = async () => {
		const hashes = selected.map((s) => s.media.hash);
		const count = hashes.length;

		const success = await softDeleteMedia(hashes);

		if (!success) {
			toast.error('Failed to delete media');
			return;
		}

		ondelete?.(hashes);

		toast.success(`${count} item${count > 1 ? 's' : ''} deleted`, {
			action: {
				label: 'Undo',
				onClick: async () => {
					const restored = await restoreMedia(hashes);
					if (restored) {
						onrestore?.(hashes);
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
