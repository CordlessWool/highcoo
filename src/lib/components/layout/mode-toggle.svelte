<script lang="ts">
	import { toggleMode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button';
	import { Sun, Moon } from '@lucide/svelte';
</script>

<Button variant="ghost" size="icon-sm" onclick={toggleMode}>
	<Sun class="h-4 w-4 scale-100 dark:scale-0" />
	<Moon class="absolute h-4 w-4 scale-0 dark:scale-100" />
	<span class="sr-only">Toggle theme</span>
</Button>
