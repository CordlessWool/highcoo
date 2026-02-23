<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	type Props = {
		ids: string[];
		active: boolean;
		selectedIds: Set<string>;
		onrangeselect: (ids: string[]) => void;
		onrangedeselect: (ids: string[]) => void;
		children: Snippet;
	} & Omit<HTMLAttributes<HTMLDivElement>, 'children'>;

	let { ids, active, selectedIds, onrangeselect, onrangedeselect, children, ...props }: Props = $props();

	let startId = $state<string | null>(null);
	let deselecting = $state(false);
	let container = $state<HTMLDivElement | null>(null);

	function getMediaId(el: Element | null): string | null {
		while (el) {
			const id = (el as HTMLElement).dataset.mediaId;
			if (id) return id;
			el = el.parentElement;
		}
		return null;
	}

	function getRange(a: string, b: string): string[] {
		const i = ids.indexOf(a);
		const j = ids.indexOf(b);
		if (i === -1 || j === -1) return [];
		const [lo, hi] = i <= j ? [i, j] : [j, i];
		return ids.slice(lo, hi + 1);
	}

	function onpointerdown(e: PointerEvent) {
		if (!active || e.button !== 0) return;
		const id = getMediaId(e.target as Element);
		if (!id) return;
		startId = id;
		deselecting = selectedIds.has(id);
		container?.setPointerCapture(e.pointerId);
		e.preventDefault();
	}

	function onpointermove(e: PointerEvent) {
		if (!active || !startId) return;
		const el = document.elementFromPoint(e.clientX, e.clientY);
		const currentId = getMediaId(el);
		if (!currentId) return;
		const range = getRange(startId, currentId);
		if (deselecting) onrangedeselect(range);
		else onrangeselect(range);
	}

	function onpointerup(e: PointerEvent) {
		startId = null;
		container?.releasePointerCapture(e.pointerId);
	}
</script>

<div
	bind:this={container}
	{...props}
	style:touch-action={active ? 'none' : undefined}
	{onpointerdown}
	{onpointermove}
	onpointerup={onpointerup}
	onpointercancel={onpointerup}
>
	{@render children()}
</div>
