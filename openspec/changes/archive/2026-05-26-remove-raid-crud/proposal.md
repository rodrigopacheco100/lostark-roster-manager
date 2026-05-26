## Why

The raid definitions (name + difficulty + min ilvl) come from game data and don't change per-user. Creating/deleting them via the UI is unnecessary — they should be seeded once and only modified directly in the database. The CRUD page (`/raids`) and its API endpoints add complexity with no value.

## What Changes

- **BREAKING**: Remove `/raids` page (CRUD UI for raid definitions)
- **BREAKING**: Remove `POST /api/raids` and `DELETE /api/raids` (create/delete raid)
- **BREAKING**: Remove `POST /api/raids/difficulties` (add difficulty to raid)
- Remove "Raids" link from sidebar navigation
- Keep `GET /api/raids` — still needed by the roster detail page to list available raids for character assignment
- Keep all DB tables (`raids`, `raid_difficulties`, `character_raids`), seed data, and dashboard/roster functionality unchanged

## Capabilities

### New Capabilities

None — this is a removal, not a new feature.

### Modified Capabilities

None — no existing specs cover raid CRUD behavior.

## Impact

- **Removed files**: `src/app/(dashboard)/raids/` directory (page + any sub-components), `src/app/api/raids/route.ts`, `src/app/api/raids/difficulties/route.ts`
- **Modified files**: `src/components/Sidebar.tsx` (remove Raids link)
- **No changes to**: DB schema, migrations, seed, queries, dashboard, roster pages, types, character raids API
