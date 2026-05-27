## Context

The roster detail page currently uses an inline single-select dropdown to add one raid at a time. Each add requires a mutation round-trip. Removal is via individual X buttons. This works but is slow for setup.

The new approach replaces the dropdown with a **combobox** (popover + search + checkboxes, following the shadcn/ui pattern at https://ui.shadcn.com/docs/components/radix/combobox). The combobox trigger shows current raid assignments as chips; opening it reveals all raid difficulties as checkable items with search. One PUT round-trip syncs the final set.

Individual X buttons on character cards remain for quick removal without opening the combobox.

## Goals / Non-Goals

**Goals:**
- Combobox popover with search input to filter raid difficulties by name
- All eligible raid difficulties shown as items with checkboxes; already-assigned ones pre-checked
- Selected items appear as chips inside the combobox trigger, each with an X to remove individually
- User can check up to 3 total; UI prevents checking a 4th (checkbox disabled + message)
- User cannot check two difficulties from the same raid group (e.g., Normal + Hard of "Act 1 - Aegir")
- "Save" button at the bottom of the popover sends the checked set via PUT; server diffs against DB and applies adds + removals atomically
- The old inline single-select dropdown + "Add" button is removed

**Non-Goals:**
- Drag-and-drop reordering
- Changing a raid's difficulty (must remove and re-add)
- Installing shadcn/ui or Radix as a dependency (combobox is custom-built following the same UX pattern)

## Decisions

### 1. PUT sync endpoint (same as before, unchanged)

`PUT /api/characters/:id/raids` with body `{ raidDifficultyIds: string[] }`. Server fetches current state, computes diff, validates the final set against all constraints, then applies inserts + deletes in a Drizzle transaction. Returns 200 with `{ added: number, removed: number }`.

```
Client sends:          { raidDifficultyIds: ["rd1", "rd2"] }
Server has:            ["rd1", "rd3"]
Server computes:       add: ["rd2"], remove: ["rd3"]
Validates final set:   ["rd1", "rd2"] ≤ 3 ✓, no dupes ✓, ilvl passes ✓
Applies:               INSERT rd2, DELETE rd3 (transaction)
Returns:               { added: 1, removed: 1 }
```

### 2. PUT handler in existing route file

Same as before — add `PUT` export to `src/app/api/characters/[id]/raids/route.ts`.

### 3. Custom combobox component (not shadcn dependency)

The project currently has no shadcn dependency. Rather than installing it, build a lightweight custom `RaidCombobox` component that follows the same UX pattern. It composits:

- A **trigger button** that shows selected raids as chips (like shadcn's `ComboboxChips`). Each chip has an X to remove that raid immediately (which updates local state and persists via PUT).
- A **popover** (using a combination of absolute positioning inside a relative wrapper, or the existing `Modal`-like approach but rendered inline)
- A **search input** at the top of the popover to filter raids by name
- A **scrollable list** of raid groups, each with a group header (raid name) and checkboxes for each difficulty
- A **"Save" button** at the bottom of the popover that calls PUT with the current checked set

```
┌──────────────────────────────────┐
│  [Aegir(H)] [Behemoth(N)] [✕]   │  ← trigger with chips
└──────────────────────────────────┘
           ▼ opens popover
┌──────────────────────────────────┐
│ 🔍 Search raids...               │  ← search input
├──────────────────────────────────┤
│ Act 1 - Aegir                    │  ← group header
│  ☑ Normal (IL 1610)             │  ← pre-checked
│  ☐ Hard (IL 1630)               │  ← checkable
│ Act 2 - Behemoth                 │
│  ☑ Normal (IL 1600)             │
│  ☐ Hard (IL 1620)               │
│ ...                              │
├──────────────────────────────────┤
│ 2/3 slots used    [Save]         │  ← footer
└──────────────────────────────────┘
```

### 4. Popover instead of modal

Unlike the previous modal design, the combobox uses a **popover** (positioned dropdown). The popover:
- Opens on click of the trigger button
- Closes on: click outside, Escape key, or clicking Save
- Does NOT close on item selection (user checks multiple before saving)
- Maintains its position relative to the trigger (not centered like a modal)

Implementation approaches (to be decided during implementation):
- **Portal-based**: Use `createPortal` + absolute positioning + click-outside detection (no Radix dependency needed)
- **Simple relative positioning**: `relative` wrapper + `absolute` dropdown (simpler, may overflow card boundaries)

Recommendation: portal-based for robustness, but simple positioning is acceptable for a v1.

### 5. State management: local `checkedIds`, synced on save

The combobox internally manages `checkedIds: Set<string>` initialized from the character's `characterRaids` prop. All toggling updates this local set. Only when Save is clicked (or a chip X is clicked for immediate removal) does it call the PUT endpoint.

This means:
- Chip X → immediate PUT removal (feels responsive)
- Popover check/uncheck → local only until Save
- Cancel (click outside) → local changes discarded, state resets to server state

### 6. Chip removal triggers immediate PUT

When the user clicks the X on a chip (inside the trigger), the component immediately calls PUT with that ID removed. This matches the expectation that clicking X instantly removes the raid. The popover's checked state stays in sync with the server after the PUT response.

Alternative: chips could also be local-only, deferring all changes to the Save button inside the popover. However, this creates confusion: "I clicked X but the raid is still there?" — so chip X should be immediate.

### 7. `syncCharacterRaids` query function (same as before)

Lives in `src/lib/queries.ts`.

### 8. `raidComboboxCharId` replaces inline assign state

The roster page replaces `assignCharId` / `assignRaidDifficultyId` with `raidComboboxCharId: string | null`. When set, the `RaidCombobox` renders for that character. The combobox reads the character's `characterRaids` directly from the roster data (passed as prop).

### 9. Individual X buttons preserved

Same as before — X buttons on character cards call the existing `DELETE` endpoint. The combobox's chip X also triggers a PUT, which handles removal. Both paths are valid and kept in sync via query invalidation.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| Popover positioning may overflow the card bounds | Use portal-based rendering with auto-flip positioning (or keep it simple: position below the button, accept overflow with `overflow-visible` on the card) |
| Two removal paths (chip X → PUT, card X → DELETE) could conflict if used interleaved | Each mutation invalidates the roster query, so the next open of the combobox reads fresh data. No actual conflict — just redundant |
| Drizzle transaction deadlock on concurrent PUT | Low concurrency. Acceptable for v1 |
| Popover/click-outside handling without Radix requires manual implementation | Use `useRef` + `mousedown` listener on `document` — ~20 lines. Well-understood pattern |
