# V1 Data Model + Storage (Local-only)

## Storage location
Use `browser.storage.local` (not `sync`) for all V1 state.

## Top-level key
Store everything under a single key to simplify export/import:
- `ont_v1` (object)

## Schema (conceptual)

### Root
```json
{
  "version": 1,
  "updatedAt": "2026-02-09T00:00:00.000Z",
  "settings": {},
  "tasks": [],
  "projects": []
}
```

### Task
```json
{
  "id": "t_...",
  "text": "Ship dashboard V1",
  "createdAt": "2026-02-09T00:00:00.000Z",
  "completedAt": null,
  "order": 1000
}
```

Notes:
- Flat list only; no tags/projects/priority in V1.
- `order` supports manual reordering later (optional V1).

### Project
```json
{
  "id": "p_...",
  "name": "Project A",
  "startDate": "2026-02-01",
  "endDate": "2026-03-01",
  "archivedAt": null,
  "color": "#7dd3fc"
}
```

Notes:
- Dates are stored as **YYYY-MM-DD** in local time semantics.
- `color` optional but useful for scanability.

### Settings
```json
{
  "theme": "dark",
  "showCompletedTasks": false,
  "countdown": {
    "label": "Launch",
    "targetIso": "2026-03-01T18:00:00.000Z"
  }
}
```

## Derived rules

### Active project
- `today` is active when `startDate <= today <= endDate` and `archivedAt == null`.
- Sort active projects by `endDate` ascending.

## Export/Import

### Export
- Download a JSON file of the full `ont_v1` object.
- Include `version` and `updatedAt`.

### Import options (V1 recommendation)
Two import modes:
1) **Replace**: overwrite local state entirely
2) **Merge**: merge by `id`, keeping newest `updatedAt` values

If merge is too complex for V1, ship Replace only + a warning.

