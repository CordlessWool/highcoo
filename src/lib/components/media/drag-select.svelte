<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { SvelteSet } from 'svelte/reactivity';

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
	let snapshot = new Set<string>();
	let previousRange = new SvelteSet<string>();
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

	function applyRange(range: string[]) {
		const currentRange = new Set(range);

		// Items that left the range — restore to their snapshot state
		for (const id of previousRange) {
			if (currentRange.has(id)) continue;
			const wasSelected = snapshot.has(id);
			if (wasSelected) onrangeselect([id]);
			else onrangedeselect([id]);
		}

		// Items in the current range — apply the drag operation
		const toSelect: string[] = [];
		const toDeselect: string[] = [];
		for (const id of range) {
			if (deselecting) toDeselect.push(id);
			else toSelect.push(id);
		}
		if (toSelect.length) onrangeselect(toSelect);
		if (toDeselect.length) onrangedeselect(toDeselect);

		previousRange.clear();
		for (const id of range) previousRange.add(id);
	}

	function onpointerdown(e: PointerEvent) {
		if (!active || e.button !== 0) return;
		const id = getMediaId(e.target as Element);
		if (!id) return;
		startId = id;
		deselecting = selectedIds.has(id);
		snapshot = new Set(selectedIds);
		previousRange.clear();

		applyRange([id]);

		container?.setPointerCapture(e.pointerId);
		e.preventDefault();
	}

	function onpointermove(e: PointerEvent) {
		if (!active || !startId) return;
		const el = document.elementFromPoint(e.clientX, e.clientY);
		const currentId = getMediaId(el);
		if (!currentId) return;

		applyRange(getRange(startId, currentId));
	}

	function onpointerup(e: PointerEvent) {
		startId = null;
		previousRange.clear();
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
