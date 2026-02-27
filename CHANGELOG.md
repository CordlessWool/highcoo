# highcoo

## 1.3.0

### Minor Changes

- 6bbecc1: Update login screen ui
- 4de59d1: Add `draftId` column to media table linking published snapshots back to their draft. Add `hasPublished` query for checking publish status. Copy button in slug input shows tooltip when media is not yet published.
- 29cc052: Edit slug after name if image was never published
- 3f0d896: Improve status message and splitup login and registration.

### Patch Changes

- 2054204: Use logo.png as favicon

## 1.2.4

### Patch Changes

- d643df2: Fix WORKDIR in Docker runtime stage and add container health check to CI

## 1.2.3

### Patch Changes

- 3e6e26b: Switch Docker runtime from Bun to Node.js to fix file upload validation. Bun's `instanceof File` bypasses JS proxy traps, causing `v.file()` validation to fail for SvelteKit's `LazyFile`. Running the built app under Node resolves this. Also optimized dependencies: moved bundleable packages to devDependencies, keeping only `sharp`, `@simplewebauthn/server`, and `drizzle-kit` as runtime dependencies.
- 11ac8b3: Fix watermark upload failing in Bun runtime

  `v.file()` from valibot uses `instanceof File` which fails in Bun because Bun's native type checks bypass the JS prototype chain, so SvelteKit's `LazyFile` proxy (which tricks Node.js via `getPrototypeOf`) does not work. Replaced with a duck-type validator that checks for file-like properties (`name`, `type`, `size`, `arrayBuffer`).

## 1.2.2

### Patch Changes

- 17f855a: Fix watermark upload on the settings page. The upload form was failing because `removeWatermark` in `settings.remote.ts` was reused as a helper inside the module — but `.remote.ts` files may only export remote functions. The fix extracts a shared `clearWatermark` helper (private to the module) called by both `removeWatermark` and `uploadWatermark`, and moves the generic file-deletion logic into `$lib/server/files` as `deleteFile`. Also adds E2E tests covering the settings page watermark upload and opacity persistence.

## 1.2.1

### Patch Changes

- d11ccc4: Set BODY_SIZE_LIMIT to Infinity by default so large file uploads are not rejected by the Node adapter's 512KB limit
- d11ccc4: Fix tag edit losing focus on auto-save by avoiding unnecessary query cache updates

## 1.2.0

### Minor Changes

- e9ee548: Simplify media tile select and edit behaviour. Tiles now open for editing on focus (click) outside of select mode. Selection is only possible in select mode, with drag-to-select range support.
