<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import { FieldGroup, Field, FieldDescription } from '$lib/components/ui/field/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { startAuthentication } from '@simplewebauthn/browser';
	import { goto } from '$app/navigation';
	import { KeyRound, TriangleAlert } from '@lucide/svelte';
	import type { PageProps } from './$types';
	import { resolve } from '$app/paths';

	const { data }: PageProps = $props();

	let status = $state<string | null>(null);

	const handleLogin = async () => {
		try {
			status = null;
			const optionsRes = await fetch('/auth/login', { method: 'POST' });
			const options = await optionsRes.json();

			const assertion = await startAuthentication({ optionsJSON: options });

			const verifyRes = await fetch('/auth/login', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(assertion)
			});

			if (verifyRes.ok) {
				goto('/media');
			} else {
				const err = await verifyRes.json();
				status = err.message ?? 'Login failed. Please try again.';
			}
		} catch (e) {
			if (e instanceof DOMException && e.name === 'NotAllowedError') {
				status = 'Authentication was cancelled or timed out.';
			} else {
				status = 'Login failed. Please try again.';
			}
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
								<h1 class="text-2xl font-bold">Welcome back</h1>
								<p class="text-balance text-muted-foreground">Login to your Highcoo account</p>
							</div>
							{#if status}
								<Alert.Root variant="destructive">
									<TriangleAlert />
									<Alert.Title>Sign in failed</Alert.Title>
									<Alert.Description>{status}</Alert.Description>
								</Alert.Root>
							{/if}
							<Field>
								<Button onclick={handleLogin} class="w-full">
									<KeyRound class="h-4 w-4" />
									Sign in with passkey
								</Button>
							</Field>

							{#if data.allowRegistration}
								<FieldDescription class="text-center">
									Don't have an account? <a
										href={resolve('/auth/register')}
										class="underline underline-offset-4">Sign up</a
									>
								</FieldDescription>
							{/if}
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
