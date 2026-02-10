<script lang="ts">
	import { startAuthentication, startRegistration } from '@simplewebauthn/browser';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { KeyRound } from '@lucide/svelte';
	import type { PageProps } from './$types';

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
				goto('/');
			} else {
				const err = await verifyRes.json();
				status = err.message ?? 'Login failed';
			}
		} catch (e) {
			status = e instanceof Error ? e.message : 'Login failed';
		}
	};

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
				goto('/');
			} else {
				const err = await verifyRes.json();
				status = err.message ?? 'Registration failed';
			}
		} catch (e) {
			status = e instanceof Error ? e.message : 'Registration failed';
		}
	};
</script>

<div class="flex min-h-screen items-center justify-center">
	<div class="flex w-full max-w-sm flex-col items-center gap-6">
		<img src="/logo.svg" alt="highcoo" class="h-16" />

		<div class="flex flex-col gap-3 w-full">
			<Button onclick={handleLogin} class="w-full">
				<KeyRound class="h-4 w-4" />
				Sign in with passkey
			</Button>

			{#if data.allowRegistration}
				<Button variant="outline" onclick={handleRegister} class="w-full">
					Register a new passkey
				</Button>
			{/if}
		</div>

		{#if status}
			<p class="text-sm text-destructive">{status}</p>
		{/if}
	</div>
</div>
