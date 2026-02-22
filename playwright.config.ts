import { defineConfig } from '@playwright/test';

const dbUrl =
	process.env.DATABASE_URL_TEST ?? 'postgresql://highcoo:highcoo@localhost:5432/highcoo_test';
const env = `DATABASE_URL=${dbUrl} UPLOAD_PATH=./uploads-test ORIGIN=http://localhost:4173 ALLOW_REGISTRATION=true`;

export default defineConfig({
	webServer: {
		command: `${env} bun run build && ${env} bun run preview`,
		port: 4173,
		timeout: 120000,
		reuseExistingServer: !process.env.CI
	},
	testDir: 'e2e',
	timeout: 60000,
	globalSetup: './e2e/global-setup.ts',
	projects: [
		{
			name: 'unauthenticated',
			testIgnore: '**/*.auth.test.ts'
		},
		{
			name: 'authenticated',
			testMatch: '**/*.auth.test.ts',
			use: { storageState: 'e2e/.auth.json' },
			dependencies: ['unauthenticated']
		}
	]
});
