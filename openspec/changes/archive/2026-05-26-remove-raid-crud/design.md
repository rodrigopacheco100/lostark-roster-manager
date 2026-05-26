## Context

The app currently has a `/raids` page at `src/app/(dashboard)/raids/` that provides a CRUD UI for managing global raid definitions (create raid with name + difficulties, delete raid). This is backed by two API routes: `/api/raids` (GET/POST/DELETE) and `/api/raids/difficulties` (POST). The sidebar links to this page.

Raid data comes from the game and doesn't need per-user management — it should be seeded and modified directly in the DB. The CRUD UI and its API routes can be removed without affecting the raid assignment or tracking features.

## Goals / Non-Goals

**Goals:**
- Remove the `/raids` page and its API endpoints
- Remove the sidebar link to `/raids`
- Keep `GET /api/raids` intact (used by roster detail page for raid assignment dropdown)
- Keep all DB tables, seed data, dashboard progress, and roster raid assignment working

**Non-Goals:**
- No changes to DB schema, migrations, or seed data
- No changes to dashboard, roster pages, or character raids API
- No data migration needed

## Decisions

1. **Keep `GET /api/raids`** — The roster detail page (`rosters/[id]`) fetches available raids via `GET /api/raids` to populate the assignment dropdown. This endpoint is read-only and doesn't need removal.

2. **Keep `GET /api/raids/difficulties`** — This endpoint doesn't exist; difficulties are embedded in the raid response from `GET /api/raids` via the `getAllRaids()` query. No change needed there.

3. **Remove entire `raids/` page directory** — The page at `src/app/(dashboard)/raids/` has no shared components with other features. Remove the entire directory.

4. **Remove entire API route files** — `src/app/api/raids/route.ts` and `src/app/api/raids/difficulties/route.ts` are only consumed by the `/raids` page. Remove both files entirely.

5. **Remove sidebar link** — The `/raids` link in `src/components/Sidebar.tsx` becomes a dead route. Remove the link entry.

## Risks / Trade-offs

- **Risk: Someone tries to access `/raids` directly** → Minimal risk. Next.js will return a 404 for the route since the directory is removed. The sidebar link is removed so users won't navigate there.
- **Risk: Future need to add/modify raid definitions via UI** → This is an intentional trade-off. Raid changes come from game patches; updating the seed file and re-seeding is the intended workflow.
