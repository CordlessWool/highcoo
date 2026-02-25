---
"highcoo": patch
---

Switch Docker runtime from Bun to Node.js to fix file upload validation. Bun's `instanceof File` bypasses JS proxy traps, causing `v.file()` validation to fail for SvelteKit's `LazyFile`. Running the built app under Node resolves this. Also optimized dependencies: moved bundleable packages to devDependencies, keeping only `sharp`, `@simplewebauthn/server`, and `drizzle-kit` as runtime dependencies.
