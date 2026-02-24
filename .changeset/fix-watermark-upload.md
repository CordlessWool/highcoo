---
"highcoo": patch
---

Fix watermark upload on the settings page. The upload form was failing because `removeWatermark` in `settings.remote.ts` was reused as a helper inside the module — but `.remote.ts` files may only export remote functions. The fix extracts a shared `clearWatermark` helper (private to the module) called by both `removeWatermark` and `uploadWatermark`, and moves the generic file-deletion logic into `$lib/server/files` as `deleteFile`. Also adds E2E tests covering the settings page watermark upload and opacity persistence.
