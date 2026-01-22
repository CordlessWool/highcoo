# Tags System

Tags are a core feature for organizing, filtering, and managing photos.

## Database Schema

```sql
tags:
- id (primary key)
- name (unique)
- color (optional, for UI)
- createdAt

file_tags (junction table):
- fileId (foreign key -> files)
- tagId (foreign key -> tags)
- primary key (fileId, tagId)
```

## System Tags

- `inbox` - Auto-assigned to every new upload
- System tags could have a `system: boolean` field to prevent deletion

## Upload Flow

1. Create `inbox` tag if not exists (on app init or first upload)
2. Auto-assign `inbox` tag to every new upload
3. User removes `inbox` tag when photo is processed/organized

## UI Features

### Filter Bar
- Multi-select tags
- Filter mode: ANY (union) or ALL (intersection) of selected tags
- Quick access to `inbox` filter

### Photo Modal/Detail View
- Display current tags
- Add/remove tags
- Inline tag creation

### Tag Management
- Create new tags
- Rename tags
- Delete tags (with confirmation if photos are tagged)
- Change tag color

### Bulk Operations
- Select multiple photos
- Apply/remove tags to selection

## Future Considerations

- Tag hierarchy/nesting
- Smart tags (auto-assigned based on rules/AI)
- Tag aliases/synonyms
