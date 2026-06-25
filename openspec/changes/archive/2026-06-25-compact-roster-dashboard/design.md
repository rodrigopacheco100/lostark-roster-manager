## Context

The owner-level raid summary pills currently render in a dedicated `<div className="mb-3 flex flex-wrap gap-1 pl-7">` below the header button. This row adds ~28px of vertical space per owner. Moving the pills into the header button row (between the owner name and the CircularProgress) eliminates that row entirely, fitting more owners on screen.

## Goals / Non-Goals

**Goals:**
- Move raid pills from below header into the header button row
- Increase owner avatar from 24x24 to 32x32
- Remove the dedicated pill row below the header
- No other changes to OwnerSection or any other file

**Non-Goals:**
- No data model, API, or type changes
- No changes to RosterDivider, Table, or any other component
- No changes to raid toggle functionality
- No changes to roster section layout, padding, or spacing

## Decisions

| Decision | Rationale |
|---|---|
| Pills between `</h2>` and `<CircularProgress>` | Maintains natural left-to-right flow: identity → status → progress |
| `{raidGroups.length > 0 && (...)}` guard | Prevents rendering empty pill container when there are no raids |
| Avatar 32x32 (h-8 w-8) | 24x24 was small next to text-xl; 32x32 improves visibility without dominating |

## Risks / Trade-offs

- Pills may wrap to a second line on narrow viewports → The button uses `flex` layout so wrapping is natural and does not break the UI
