<script lang="ts">
	import * as InputGroup from '$lib/components/ui/input-group';
	import * as Popover from '$lib/components/ui/popover';
	import { SaveStatus, getErrorMessage } from './helper';

	type Props = {
		value?: string;
		onsave?: (value: string) => Promise<void>;
		delay?: number;
	};

	const palette = [
		'#ef4444',
		'#f97316',
		'#f59e0b',
		'#eab308',
		'#84cc16',
		'#22c55e',
		'#14b8a6',
		'#06b6d4',
		'#3b82f6',
		'#6366f1',
		'#8b5cf6',
		'#a855f7',
		'#d946ef',
		'#ec4899',
		'#f43f5e',
		'#78716c'
	];

	let { value = $bindable(''), onsave, delay = 500 }: Props = $props();

	let status = $state(SaveStatus.Idle);
	let errorMessage = $state('');
	let open = $state(false);
	let timer: ReturnType<typeof setTimeout>;

	const save = (val: string) => {
		value = val;
		if (!onsave) return;
		clearTimeout(timer);
		timer = setTimeout(async () => {
			status = SaveStatus.Saving;
			errorMessage = '';
			try {
				await onsave(val);
				status = SaveStatus.Saved;
			} catch (e) {
				status = SaveStatus.Error;
				errorMessage = getErrorMessage(e);
			}
		}, delay);
	};

	const selectColor = (color: string) => {
		open = false;
		save(color);
	};

	const handleInput = (e: Event) => {
		const val = (e.target as HTMLInputElement).value;
		value = val;
		if (status === SaveStatus.Error) {
			status = SaveStatus.Idle;
			errorMessage = '';
		}
		if (/^#[0-9a-fA-F]{6}$/.test(val)) {
			save(val);
		}
	};
</script>

<div class="space-y-1">
	<InputGroup.Root>
		<InputGroup.Addon align="inline-start">
			<Popover.Root bind:open>
				<Popover.Trigger>
					{#snippet child({ props: triggerProps })}
						<InputGroup.Button
							{...triggerProps}
							variant="ghost"
							size="icon-xs"
							aria-label="Pick color"
						>
							<span
								class="size-4 rounded-full border"
								style:background-color={value || 'transparent'}
							></span>
						</InputGroup.Button>
					{/snippet}
				</Popover.Trigger>
				<Popover.Content class="w-auto p-3" align="start">
					<div class="grid grid-cols-4 gap-2">
						{#each palette as color (color)}
							<button
								class="size-6 rounded-full border transition-transform hover:scale-110"
								class:ring-2={value === color}
								class:ring-primary={value === color}
								class:ring-offset-1={value === color}
								style:background-color={color}
								aria-label={color}
								onclick={() => selectColor(color)}
							></button>
						{/each}
					</div>
				</Popover.Content>
			</Popover.Root>
		</InputGroup.Addon>
		<InputGroup.Input {value} oninput={handleInput} placeholder="#000000" />
	</InputGroup.Root>
	{#if status === SaveStatus.Error && errorMessage}
		<p class="text-xs text-destructive">{errorMessage}</p>
	{/if}
</div>
