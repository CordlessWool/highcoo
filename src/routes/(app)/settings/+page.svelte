<script lang="ts">
	import * as Layout from '$lib/components/layout';
	import { Button } from '$lib/components/ui/button';
	import * as Form from '$lib/components/form';
	import { ImageOff, Trash2, Replace } from '@lucide/svelte';
	import { resolve } from '$app/paths';
	import {
		uploadWatermark,
		removeWatermark,
		patchSettings,
		getSettings
	} from '$lib/components/settings/settings.remote';
	import { WatermarkPosition } from '$lib/logic/settings';
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();
	const settings = $derived(await getSettings());

	const previewSrc = $derived.by(() => {
		if (!settings.watermarkFileHash || !data.sampleMedia) return null;
		const base = resolve('/(app)/file/[hash]', { hash: data.sampleMedia.fileHash });
		const params = new URLSearchParams({
			w: '600',
			wm: settings.watermarkFileHash,
			wm_pos: settings.watermarkPosition,
			wm_opacity: String(settings.watermarkOpacity)
		});
		return `${base}?${params}`;
	});

	let fileInputRef = $state<HTMLInputElement | null>(null);

	const positions = [
		{ value: WatermarkPosition.BottomRight, label: 'Bottom Right' },
		{ value: WatermarkPosition.BottomLeft, label: 'Bottom Left' },
		{ value: WatermarkPosition.TopRight, label: 'Top Right' },
		{ value: WatermarkPosition.TopLeft, label: 'Top Left' },
		{ value: WatermarkPosition.Center, label: 'Center' }
	];
</script>

<main class="flex min-h-screen w-full flex-col gap-2">
	<Layout.BaseBar />

	<div class="mx-auto w-full max-w-2xl p-6">
		<h1 class="mb-6 text-2xl font-bold">Settings</h1>

		<section class="flex flex-col gap-6">
			<div>
				<h2 class="text-lg font-semibold">Watermark</h2>
				<p class="text-sm text-muted-foreground">
					Applied to all public images. PNG or WebP with transparency recommended.
				</p>
			</div>

			<div class="flex items-start gap-6">
				{#if settings.watermarkFileHash}
					<img
						src="{resolve('/(app)/file/[hash]', { hash: settings.watermarkFileHash })}?w=200"
						alt="Current watermark"
						class="h-32 w-32 rounded-lg border object-contain p-2"
					/>
				{:else}
					<div
						class="flex h-32 w-32 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-muted-foreground"
					>
						<ImageOff class="h-8 w-8" />
						<span class="text-xs">No watermark</span>
					</div>
				{/if}

				<form {...uploadWatermark} enctype="multipart/form-data" class="flex flex-col gap-2">
					<input
						{...uploadWatermark.fields.watermark.as('file')}
						accept="image/png,image/webp,image/svg+xml"
						class="hidden"
						bind:this={fileInputRef}
						onchange={(e) => e.currentTarget.form?.requestSubmit()}
					/>
					{#if settings.watermarkFileHash}
						<Button
							variant="outline"
							size="sm"
							type="button"
							onclick={() => fileInputRef?.click()}
						>
							<Replace class="mr-2 h-4 w-4" />
							Replace
						</Button>
						<Button variant="outline" size="sm" type="button" onclick={() => removeWatermark()}>
							<Trash2 class="mr-2 h-4 w-4" />
							Remove
						</Button>
					{:else}
						<Button
							variant="outline"
							size="sm"
							type="button"
							onclick={() => fileInputRef?.click()}
						>
							Add watermark
						</Button>
					{/if}
				</form>
			</div>

			{#if settings.watermarkFileHash}
				<div class="flex flex-col gap-4">
					<Form.Select
						label="Position"
						value={settings.watermarkPosition}
						options={positions}
						onsave={async (value) => {
							await patchSettings({ watermarkPosition: value as WatermarkPosition });
						}}
					/>

					<Form.Input
						label="Opacity"
						value={String(settings.watermarkOpacity)}
						info="Value between 0 and 1"
						onsave={async (value) => {
							const opacity = parseFloat(value);
							if (!isNaN(opacity) && opacity >= 0 && opacity <= 1) {
								await patchSettings({ watermarkOpacity: opacity });
							}
						}}
					/>
				</div>
			{/if}
		</section>

		{#if previewSrc}
			<section class="mt-8 flex flex-col gap-4">
				<h2 class="text-lg font-semibold">Preview</h2>
				<p class="text-sm text-muted-foreground">How images will appear on the public site.</p>
				<img src={previewSrc} alt="Watermark preview" class="max-w-md rounded-lg border" />
			</section>
		{/if}
	</div>
</main>
