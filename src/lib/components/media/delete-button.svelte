<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Trash2 } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { softDeleteMedia, restoreMedia } from './media.remote';

	type Props = {
		selected: string[];
		ondelete?: (ids: string[]) => void;
		onrestore?: (ids: string[]) => void;
	};

	let { selected, ondelete, onrestore }: Props = $props();

	const handleDelete = async () => {
		const ids = selected.slice();
		const count = ids.length;

		try {
			await softDeleteMedia(ids);
		} catch {
			toast.error('Failed to delete media');
			return;
		}

		ondelete?.(ids);

		toast.success(`${count} item${count > 1 ? 's' : ''} deleted`, {
			action: {
				label: 'Undo',
				onClick: async () => {
					try {
						await restoreMedia(ids);
						onrestore?.(ids);
					} catch {
						toast.error('Failed to restore media');
					}
				}
			}
		});
	};
</script>

<Button
	variant="outline"
	size="sm"
	onclick={handleDelete}
	aria-label="Delete"
	class="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
>
	<Trash2 />
</Button>
