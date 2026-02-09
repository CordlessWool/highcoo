<script lang="ts">
	import NavDropdown from './nav-dropdown.svelte';
	import ModeToggle from './mode-toggle.svelte';
</script>

<div class="flex items-center gap-3">
	<img src="/logo.svg" alt="Logo" class="h-10" />
	<NavDropdown />
	<ModeToggle />
</div>
