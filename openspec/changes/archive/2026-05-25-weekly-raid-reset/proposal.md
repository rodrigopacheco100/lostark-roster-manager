## Why

The app can assign raids to characters but cannot track whether those raids have been completed each week. Lost Ark resets every Wednesday, and players need a quick way to see which characters have cleared which raids in the current week — both for themselves and for their friends. Currently the dashboard only shows the user's own rosters, making it hard to coordinate with friends.

## What Changes

- Add `completed boolean not null default false` column to `character_raids` table
- Add API to toggle completion status (complete/incomplete) for a character's assigned raid
- Add external reset endpoint `POST /api/reset` protected by `X-API-KEY` header that sets all `completed = false`
- Replace SWR with `@tanstack/react-query` for data fetching
- Extend the dashboard to include friends' rosters alongside the user's own rosters
- Display completion status with clickable checkbox on each raid badge/pill
- Aggregate per-raid progress badges at both roster level and owner level (e.g. "3/5 Valtan (Normal)")
- Sections collapsed by default, expandable on click
- Weekly Progress bar reflects only the logged user's own rosters
- Raids sorted by min item level in the API payload
- Compact, organized layout with collapsible friend/roster sections and progress summaries

## Capabilities

### New Capabilities
- `weekly-reset`: Weekly raid completion tracking per character, toggle API, external reset endpoint with API key auth
- `shared-dashboard`: Unified view of own and friends' rosters with per-raid completion badges, compact layout, progress summaries

### Modified Capabilities
- `dashboard`: Expanded to include friends' rosters and per-character raid completion status

## Impact

- `src/db/schema/index.ts` — add `completed boolean not null default false` to `character_raids`
- `src/db/queries.ts` — add `toggleRaidCompletion` query
- `src/app/api/characters/[id]/raids/route.ts` — add PATCH for completion toggle
- `src/app/api/reset/route.ts` — new external reset endpoint
- `src/app/api/dashboard/route.ts` — extend to include friends' rosters with completion data; raids sorted by minIlvl
- `src/app/providers.tsx` — new QueryClientProvider wrapper
- `src/app/layout.tsx` — wrap with Providers
- `src/app/(dashboard)/dashboard/page.tsx` — simplified, imports from `_compose`/`_types`
- `src/app/(dashboard)/dashboard/_compose/` — extracted components (OwnerSection, RosterSection, RaidCheckbox)
- `src/app/(dashboard)/dashboard/_types/index.ts` — extracted TypeScript types
- `.env` — add `RESET_API_KEY`
- `package.json` — add `@tanstack/react-query`
- Database migration for new column on `character_raids`
