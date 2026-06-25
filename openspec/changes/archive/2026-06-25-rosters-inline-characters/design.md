## Context

The `/rosters` list page now handles all roster and character management inline — CRUD, raid assignment, reorder, and AGS import — via collapsible sections, eliminating the need for a separate detail page. The old `/rosters/[id]` detail page has been removed.

## Goals / Non-Goals

**Goals:**
- Expand each roster card on `/rosters` into a collapsible section showing its characters
- Support all character operations inline: add, edit, delete, reorder
- Support raid assignment inline via RaidCombobox
- Support AGS character import inline via existing modal

**Non-Goals:**
- No API changes — all endpoints already serve the needed data
- No changes to the RaidCombobox, SortableList, or AddRosterCharactersModal components themselves
- No changes to the AGS sync-ilvl flow (already on the list page)

## Decisions

**1. Single collapsible state using a `Set<string>` of expanded roster IDs**

Each roster's collapsible section toggles independently. Using a `Set` avoids re-rendering all sections when one toggles. The roster ID is the stable key.

**2. Character forms inline (not a modal)**

Each section has an "Add Character" form at the top and inline edit fields replacing the character row when editing.

**3. Each collapsible section manages its own state for its children**

Add-character form fields, edit-character state, raid combobox toggle, and reorder state are scoped per section, not global. This avoids complexity and keeps the component self-contained.

**4. Single active reorder state, inline Save/Discard**

Character reorder is tracked globally in the page component via `charReorderRosterId` — only one roster can be in reorder mode at a time. Save and Discard buttons appear inline next to the "Cancel Reorder" button (no FloatingSaveBar). When Discard is clicked or another roster's reorder is activated, the working order ref is reset so the next activation starts fresh from the query data.

**5. Components are extracted to keep the page file manageable**

Given the page will grow significantly, character-specific UI logic (character row, add form, edit form) will be extracted into smaller sub-components within the same file or co-located components. This prevents a single 700+ line file.

**6. Compact character row layout**

Character rows use a single-line flex-wrap layout (`px-3 py-1.5` bg-surface-hover) with name, class badge, item level, raid badges, Raids button, and edit/delete actions all in one container, instead of nested Card components with separate sections. The Raids button sits inline next to the raid badges, and the edit/delete buttons are pushed right with `ml-auto`.

**7. RaidCombobox clicks outside cancel editing**

Clicking outside the RaidCombobox (or pressing Escape) calls `onClose()` directly, closing the entire combobox and returning to the normal Raids button, rather than just collapsing the popover overlay.

## Risks / Trade-offs

- **[Low] Page size** — the page is ~106 lines of orchestration with extracted compose components. Maintained by keeping each component focused.
- **[Low] RaidCombobox z-index** — the combobox uses a popover that needs proper z-indexing inside collapsible sections. Mitigation: use the same portal-based approach already used by RaidCombobox.
- **[Low] Performance with many rosters** — each expanded roster fetches character+raid data already included in the initial query. No additional API calls needed, so performance impact is minimal.
- **[Low] Reorder collision with roster reorder** — the page already has roster-level reorder. Character reorder inside a section could conflict. Mitigation: roster reorder and character reorder are mutually exclusive states.
