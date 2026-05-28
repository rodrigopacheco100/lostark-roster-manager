## Why

The dashboard roster list is a single-column vertical stack (`space-y-3`). On widescreens this leaves massive unused horizontal space — roster cards stretch full-width with sparse content (a name, ilvl, and a few raid pills per row). Users with many rosters must scroll vertically past every single one. A flex-wrap layout lets rosters sit side-by-side when space allows, drastically reducing scroll distance and making the dashboard feel more like a proper overview.

## What Changes

- `OwnerSection.tsx` — Replace the `.space-y-3` roster container with `flex flex-wrap gap-3`. Add `min-w` and `flex-1` to each roster card so they grow to fill available space but wrap to new rows when not enough room.
- No data model, API, or logic changes — pure CSS layout change.
- Existing character table inside each roster card stays untouched.
- Collapse/expand behavior, raid summary pills, and all interactions remain identical.

## Capabilities

### New Capabilities

None — this is a pure layout refinement of an existing component, not a new capability.

### Modified Capabilities

None — no spec-level behavior or contract changes.

## Impact

- **File changed**: `src/app/(dashboard)/dashboard/_compose/OwnerSection.tsx`
- **No API changes**, no new dependencies, no data model changes
- **No regression risk** — the roster cards themselves are unchanged, only their parent container layout
- **Responsive by nature** — flex-wrap automatically collapses to single column on narrow viewports
