## 1. Database & Schema

- [x] 1.1 Add `sortOrder: integer("sort_order").notNull().default(0)` to both `rosters` and `characters` tables in `src/db/schema/index.ts`
- [x] 1.2 Generate a new Drizzle migration: `npm run db:generate`

## 2. API Routes

- [x] 2.1 Create `src/app/api/rosters/reorder/route.ts` — `PUT` handler accepting `{ ids: string[] }`, updates `sort_order` sequentially in a transaction
- [x] 2.2 Create `src/app/api/characters/reorder/route.ts` — `PUT` handler accepting `{ ids: string[], rosterId: string }`, verifies roster ownership, updates `sort_order` sequentially in a transaction
- [x] 2.3 Update `getRosters` in `src/lib/queries.ts` to add `orderBy: [asc(rosters.sortOrder), asc(rosters.createdAt)]`
- [x] 2.4 Update `getCharacters` to add `orderBy: [asc(characters.sortOrder), asc(characters.createdAt)]`
- [x] 2.5 Update `getRoster` query to order characters by `[asc(sortOrder), asc(createdAt)]`
- [x] 2.6 Add `reorderRosters(ids, userId)` and `reorderCharacters(ids, rosterId)` query functions

## 3. Dependencies & Shared Components

- [x] 3.1 Install `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- [x] 3.2 Create `src/components/SortableList.tsx` — reusable component wrapping @dnd-kit primitives with internal `orderedItems` state, drag handle, DragOverlay, vertical-only axis constraint, and `sortable` prop to toggle DnD mode
- [x] 3.3 Create `src/components/FloatingSaveBar.tsx` — floating bar at page bottom that shows "Reorder mode", "Save Changes" (disabled until dirty), and "Discard"

## 4. UI — Rosters List Page

- [x] 4.1 Update `src/app/(dashboard)/rosters/page.tsx` — wrap roster cards in `SortableList` with `sortable={isReordering}`
- [x] 4.2 Add "Reorder" toggle button below the create form, disabled during reorder mode
- [x] 4.3 Add local reorder tracking via `useRef`, dirty state, and floating save bar (visible during reorder mode, save/discard exits mode)

## 5. UI — Roster Detail Page

- [x] 5.1 Update `src/app/(dashboard)/rosters/[id]/page.tsx` — wrap character cards in `SortableList` with `sortable={isReordering}`
- [x] 5.2 Same "Reorder" toggle + floating save bar pattern as rosters page
