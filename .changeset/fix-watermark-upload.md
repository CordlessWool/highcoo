---
"highcoo": patch
---

Fix watermark upload failing in Bun runtime

`v.file()` from valibot uses `instanceof File` which fails in Bun because Bun's native type checks bypass the JS prototype chain, so SvelteKit's `LazyFile` proxy (which tricks Node.js via `getPrototypeOf`) does not work. Replaced with a duck-type validator that checks for file-like properties (`name`, `type`, `size`, `arrayBuffer`).
