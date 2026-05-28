## Context

Rosters and characters currently lack any ordering column. They are displayed in database-return order (insertion order), which is not user-controllable. The roster list page (`/rosters`) shows roster cards, and the roster detail page (`/rosters/[id]`) shows character cards. Both need drag-and-drop reordering.

The project uses Next.js 14 App Router with Drizzle ORM (PostgreSQL). No drag-and-drop library is currently installed.

## Goals / Non-Goals

**Goals:**
- Allow reordering rosters via drag-and-drop on `/rosters`
- Allow reordering characters via drag-and-drop on `/rosters/[id]`
- Reorder mode activated by a toggle button ("Reorder") — button is disabled while mode is active
- Floating save bar appears as soon as reorder mode is activated
- Persist order only when user explicitly clicks "Save Changes"
- Display rosters and characters in the user's defined order everywhere (dashboard, sidebar if applicable)

**Non-Goals:**
- Reordering in the dashboard view (friends' rosters are not user-controllable anyway)
- Reordering raids within a character (already sorted by ilvl)
- Reordering via the sidebar

## Decisions

### Approach: `sortOrder` integer column + batch reorder API + @dnd-kit + toggle mode + floating save bar

**Database**: Add `sort_order integer not null default 0` to both `rosters` and `characters`. Existing rows get 0.

**API**: Two endpoints that accept an ordered array of IDs:

- `PUT /api/rosters/reorder` — body: `{ ids: string[] }` — sets `sort_order` sequentially (0, 1, 2, ...)
- `PUT /api/characters/reorder` — body: `{ ids: string[], rosterId: string }` — verifies roster ownership, sets `sort_order` sequentially

**Queries**: Update `getRosters`, `getRoster`, and `getCharacters` to add `orderBy: [asc(sortOrder), asc(createdAt)]`.

**UI — SortableList component (`src/components/SortableList.tsx`)**:
- Wraps `@dnd-kit/core` `DndContext` + `@dnd-kit/sortable` `SortableContext` / `useSortable`
- `sortable` prop controls whether DnD is active (handles visible, DndContext rendered) or a plain list is shown
- Maintains internal `orderedItems` state for smooth drag-and-drop without depending on parent re-render
- Each item gets a drag handle (`GripVertical`) on the left when sortable
- `DragOverlay` includes the drag handle so the dragged item maintains identical width
- Vertical-only axis constraint via custom modifier (`x: 0`)
- `useEffect` syncs `orderedItems` when external `items` prop changes
- On drag end: updates internal state and calls `onReorder(ids)`
- Placeholder ghost at original position uses `opacity: 0.3` during drag

**UI — Floating save bar (`src/components/FloatingSaveBar.tsx`)**:
- Fixed at bottom center, uses `bg-surface-elevated` (app theme color)
- Label: "Reorder mode"
- "Save Changes" button — disabled until at least one drag occurs (`canSave` prop)
- "Discard" button — always enabled, exits reorder mode

**UI — Pages**:
- `isReordering` state controls reorder mode
- "Reorder" button is `disabled` while mode is active
- On enter: `SortableList` gets `sortable={true}`, floating save bar appears
- On drag: `reorderDirty` set to true, "Save Changes" becomes enabled
- On save: API call → `isReordering = false`, bar disappears, button re-enabled
- On discard: query invalidated → `isReordering = false`, bar disappears, button re-enabled
- Working order IDs tracked in `useRef` (not query cache) to avoid glitches

**Why @dnd-kit:**
1. Lightweight (no heavy dependencies like react-beautiful-dnd which is deprecated)
2. Well-maintained with TypeScript support
3. Works with any layout without assumptions

## Risks / Trade-offs

- **Default sort_order = 0**: Existing rows have equal sort_order, fallback is createdAt. New order persisted on save.
- **No query cache update during drag**: SortableList uses internal state. Cache only updated on save. Avoids visual glitches.
- **Race with character creation**: Creating a character during reorder mode invalidates query, losing local reorder. Save reorder first.
