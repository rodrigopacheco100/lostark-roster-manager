## Why

Rosters imported from AGS already store `rosterGuid` and `characterGuid` in the database, but there's no visual indication of which rosters are linked to AGS, and no way to refresh character item levels after the initial import. Players' item levels change over time (new gear, honing), so the app becomes stale without a sync mechanism. The AGS API supports fetching current item levels, but there's no UI to trigger it.

## What Changes

- Add an AGS-linked badge/icon on roster cards in the `/rosters` list page when `rosterGuid` is set
- Add a "Sync ilvl" button on the `/rosters` page that updates all characters' item levels from AGS API for linked rosters
- Enforce a 1-hour cooldown between syncs using localStorage, with a visual countdown showing remaining time

## Capabilities

### New Capabilities

- `ags-linked-badge`: Visual indicator on roster cards showing whether the roster is linked to an AGS API roster (i.e., has `rosterGuid` set)
- `ags-ilvl-refresh`: Button on `/rosters` to refresh all characters' item levels from AGS API, with 1-hour cooldown persisted in localStorage

### Modified Capabilities

None - no existing specs have their requirements changed.

## Impact

- `src/app/(dashboard)/rosters/page.tsx` — add badge to roster cards and sync button
- `src/app/api/rosters/sync-ilvl/route.ts` — new API route to refresh item levels from AGS
- `src/lib/ags-api.ts` — may need a helper to update character ilvl in batch
- `src/lib/queries.ts` — may need a function to update character item level by GUID
- localStorage — cooldown tracking (no server-side rate limiting)
