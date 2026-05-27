## Why

The current dashboard is vertically bloated: each roster is wrapped in its own collapsible `Card`, and each character gets its own `Card`-like block with raids stacked below. This makes it hard to scan across rosters at a glance. With friends' rosters visible, the page quickly grows unwieldy. A more compact, table-like layout would let users see more data above the fold and compare characters/rosters at a glance.

## What Changes

- **Remove the per-roster collapsible Card** — rosters will live directly inside the expanded OwnerSection, separated by a visual divider (styled pill separator similar to the raid-selector combobox pattern)
- **Replace character blocks with a table/grid layout** — each character is a row with name, class, item level, and raids inline on the same horizontal axis
- **Remove redundant aggregate summary pills at the roster level** — keep the per-owner aggregate pills (they summarize across all rosters), drop the per-roster duplicates since data will be visible inline
- **All raid toggle functionality preserved** — `RaidCheckbox` pills remain functional within the table rows

## Capabilities

### New Capabilities
- `dashboard-compact-view`: Compact, table-like dashboard layout with roster separators and inline raid data, replacing the nested collapsible card hierarchy

### Modified Capabilities

None — no existing spec behavior changes. This is purely a visual/layout change.

## Impact

- `src/app/(dashboard)/dashboard/_compose/OwnerSection.tsx` — rewritten to render rosters inline (not as separate `RosterSection` cards)
- `src/app/(dashboard)/dashboard/_compose/RosterSection.tsx` — removed (functionality absorbed into OwnerSection)
- `src/app/(dashboard)/dashboard/_compose/RaidCheckbox.tsx` — kept as-is (no changes needed)
- No API changes, no DB changes, no dependency additions
