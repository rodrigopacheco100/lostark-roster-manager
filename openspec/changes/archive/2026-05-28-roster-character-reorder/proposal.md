## Why

Rosters and characters currently have no defined ordering — they appear in whatever order the database returns them (effectively insertion order). Users need to be able to arrange their rosters and characters in a custom order (e.g., putting their main roster first, ordering characters by importance within a roster).

## What Changes

- Add `sort_order` column to `rosters` and `characters` tables
- Add batch reorder API endpoints (`PUT /api/rosters/reorder`, `PUT /api/characters/reorder`)
- Add drag-and-drop reordering UI using `@dnd-kit` on the rosters list page and roster detail page
- Add `SortableList` reusable component with internal state management, vertical axis constraint, and drag handle visibility
- Add `FloatingSaveBar` component for Discord-like save/discard pattern
- Update all queries to order by `sort_order`
- Reorder does not persist immediately — user must click "Save Changes" to commit

## Capabilities

### New Capabilities

- `roster-reorder`: Allow users to reorder their rosters via drag-and-drop on the rosters list page (`/rosters`)
- `character-reorder`: Allow users to reorder characters within a roster via drag-and-drop on the roster detail page (`/rosters/[id]`)

### Modified Capabilities

*(No existing specs are modified.)*

## Impact

- **Schema**: `src/db/schema/index.ts` — add `sortOrder` to both rosters and characters
- **Migration**: New Drizzle migration for the new columns
- **Queries**: `src/lib/queries.ts` — update `getRosters`, `getRoster`, `getCharacters` to order by `sortOrder`; add `reorderRosters` and `reorderCharacters` helpers
- **API**: `PUT /api/rosters/reorder` (body `{ ids }`) and `PUT /api/characters/reorder` (body `{ ids, rosterId }`)
- **Components**: `src/components/SortableList.tsx` — reusable DnD wrapper; `src/components/FloatingSaveBar.tsx` — floating save button
- **UI**: `src/app/(dashboard)/rosters/page.tsx` — add DnD on roster cards + floating save bar; `src/app/(dashboard)/rosters/[id]/page.tsx` — add DnD on character cards + floating save bar
- **Dependencies**: `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities`
