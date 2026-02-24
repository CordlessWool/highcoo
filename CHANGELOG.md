# highcoo

## 1.2.1

### Patch Changes

- d11ccc4: Set BODY_SIZE_LIMIT to Infinity by default so large file uploads are not rejected by the Node adapter's 512KB limit
- d11ccc4: Fix tag edit losing focus on auto-save by avoiding unnecessary query cache updates

## 1.2.0

### Minor Changes

- e9ee548: Simplify media tile select and edit behaviour. Tiles now open for editing on focus (click) outside of select mode. Selection is only possible in select mode, with drag-to-select range support.
