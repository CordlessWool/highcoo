import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'ORIGIN=http://localhost:4173 ALLOW_REGISTRATION=true bun run build && ORIGIN=http://localhost:4173 ALLOW_REGISTRATION=true bun run preview',
		port: 4173
	},
	testDir: 'e2e',
	globalSetup: './e2e/global-setup.ts',
	projects: [
		{
			name: 'unauthenticated',
			testIgnore: '**/*.auth.test.ts'
		},
		{
			name: 'authenticated',
			testMatch: '**/*.auth.test.ts',
			use: { storageState: 'e2e/.auth.json' }
		}
	]
});
