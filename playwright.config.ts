import { defineConfig } from '@playwright/test';

const dbUrl =
	process.env.DATABASE_URL_TEST ?? 'postgresql://highcoo:highcoo@localhost:5432/highcoo_test';
const env = `DATABASE_URL=${dbUrl} UPLOAD_PATH=./uploads-test ORIGIN=http://localhost:4173 ALLOW_REGISTRATION=true`;

export default defineConfig({
	webServer: process.env.BASE_URL
		? undefined
		: {
				command: `${env} bun run build && ${env} bun run preview`,
				port: 4173,
				timeout: 120000,
				reuseExistingServer: !process.env.CI
			},
	use: {
		baseURL: process.env.BASE_URL ?? 'http://localhost:4173'
	},
	testDir: 'e2e',
	timeout: 60000,
	globalSetup: './e2e/global-setup.ts',
	projects: [
		{
			name: 'seeding',
			testMatch: '**/seeding.setup.ts',
			use: { storageState: 'e2e/.auth.json' }
		},
		{
			name: 'authenticated',
			testMatch: ['**/*.auth.test.ts'],
			testIgnore: ['**/logout.auth.test.ts'],
			use: { storageState: 'e2e/.auth.json' },
			dependencies: ['seeding']
		},
		{
			name: 'logout',
			testMatch: '**/logout.auth.test.ts',
			use: { storageState: 'e2e/.auth.json' },
			dependencies: ['authenticated']
		},
		{
			name: 'watermark-restore',
			testMatch: '**/watermark-restore.setup.ts',
			use: { storageState: 'e2e/.auth.json' },
			dependencies: ['logout']
		},
		{
			name: 'unauthenticated',
			testIgnore: ['**/*.auth.test.ts', '**/*.setup.ts'],
			dependencies: ['watermark-restore']
		}
	]
});
