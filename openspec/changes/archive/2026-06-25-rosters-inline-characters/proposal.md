## Why

Currently, users must navigate from `/rosters` to `/rosters/[id]` to manage characters, assign raids, and import AGS characters. This creates unnecessary friction — the list page already fetches all roster data with nested characters and raids. Bringing character management inline into collapsible sections eliminates page navigation and provides a single-pane-of-glass view for all rosters.

## What Changes

- Add collapsible sections under each roster card on `/rosters` showing its characters, with full CRUD (add, edit, delete, reorder)
- Add inline raid assignment via RaidCombobox per character, same as the detail page
- Add "Import Characters from AGS" button inside the collapsible section when the roster has `rosterGuid`
- Character reorder with drag handles inside each collapsible section (FloatingSaveBar)
- Detail page at `/rosters/[id]` remains functional but is no longer required for daily management
- The `GET /api/rosters` response already contains the full nested data needed — no new API routes

## Capabilities

### New Capabilities

- `inline-roster-management`: Collapsible per-roster sections on `/rosters` with character CRUD, raid assignment, character reorder, and AGS character import

### Modified Capabilities

None — no spec-level requirement changes. The existing capabilities (character CRUD, raid assignment, reorder, AGS import) remain unchanged; only their UI location changes.

## Impact

- `src/app/(dashboard)/rosters/page.tsx` — major expansion: add collapsible state per roster, inline character add/edit/delete forms, inline RaidCombobox, inline character reorder, inline import modal trigger
- `src/app/(dashboard)/rosters/[id]/page.tsx` — still exists, no functional changes, but usage may decline
- No API changes — all endpoints already serve the list page's data requirements
- Query invalidation: the list uses `["/api/rosters"]` key, mutations on inline actions will invalidate this key instead of the detail key
