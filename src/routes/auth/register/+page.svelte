<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { FieldGroup, Field, FieldDescription } from '$lib/components/ui/field/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { startRegistration } from '@simplewebauthn/browser';
	import { goto } from '$app/navigation';
	import { KeyRound } from '@lucide/svelte';
	import { resolve } from '$app/paths';

	let status = $state<string | null>(null);

	const handleRegister = async () => {
		try {
			status = null;
			const optionsRes = await fetch('/auth/register', { method: 'POST' });
			const options = await optionsRes.json();

			const attestation = await startRegistration({ optionsJSON: options });

			const verifyRes = await fetch('/auth/register', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(attestation)
			});

			if (verifyRes.ok) {
				goto('/media');
			} else {
				const err = await verifyRes.json();
				status = err.message ?? 'Registration failed';
			}
		} catch (e) {
			status = e instanceof Error ? e.message : 'Registration failed';
		}
	};
</script>

<div class="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
	<div class="min-h-fit w-full max-w-sm md:h-[57svh] md:max-w-5xl">
		<div class="flex h-full flex-col gap-6">
			<Card.Root class="h-full overflow-hidden p-0">
				<Card.Content class="grid h-full p-0 md:grid-cols-5">
					<form class="flex items-center p-6 md:col-span-2 md:p-8">
						<FieldGroup>
							<div class="flex flex-col items-center gap-2 text-center">
								<h1 class="text-2xl font-bold">Create an account</h1>
								<p class="text-balance text-muted-foreground">Register a passkey for Highcoo</p>
							</div>

							<Field>
								<Button onclick={handleRegister} class="w-full">
									<KeyRound class="h-4 w-4" />
									Register with passkey
								</Button>
							</Field>

							{#if status}
								<p class="text-center text-sm text-destructive">{status}</p>
							{/if}

							<FieldDescription class="text-center">
								Already have an account? <a
									href={resolve('/auth/login')}
									class="underline underline-offset-4">Sign in</a
								>
							</FieldDescription>
						</FieldGroup>
					</form>
					<div class="relative hidden bg-muted p-0 md:col-span-3 md:block">
						<img
							src="https://images.unsplash.com/photo-1615474849293-4142bc2d7cc3?w=987&auto=format&fit=crop"
							alt="placeholder"
							class="absolute inset-0 h-full w-full object-cover p-0"
						/>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</div>
