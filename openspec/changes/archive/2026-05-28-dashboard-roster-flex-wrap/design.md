## Context

The dashboard's `OwnerSection` component renders rosters inside a `<div className="space-y-3 pl-1">` — a pure vertical stack. Each roster card contains a `<table>` with character rows (name, ilvl, raid checkboxes). On screens wider than ~1200px — which covers most desktop users — roster cards stretch to the full width of the main content area (~800–1100px depending on sidebar), while the table content rarely exceeds ~500px. This wastes the right half of each card.

The `/groups` page already demonstrates a responsive grid pattern (`sm:grid-cols-2 lg:grid-cols-3`). The roster layout change follows a similar principle but uses `flex-wrap` instead of CSS Grid for simpler behavior with variable-height cards.

## Goals / Non-Goals

**Goals:**
- Rosters within an owner section sit side-by-side when horizontal space allows
- Layout collapses gracefully to single column on narrow viewports (mobile, sidebar-heavy layouts)
- Zero behavior changes — interactions, data, collapse/expand, raid toggles all work identically
- Minimal diff — only the container and card width classes change

**Non-Goals:**
- Extracting rosters into standalone cards (they stay inside the owner section)
- Changing the character table or any inner markup
- Making the rosters page or roster detail page responsive — this is dashboard-only
- Introducing breakpoint-specific classes — flex-wrap with min-width handles it naturally

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Layout mechanism | `flex flex-wrap gap-3` over CSS Grid | Flex-wrap naturally wraps items of varying height. Grid requires explicit column counts per breakpoint (e.g., `grid-cols-1 sm:grid-cols-2`). Flex-wrap with `min-w` adapts to the container width without media queries. |
| Roster card width | `min-w-[620px] flex-1` | `min-w-[620px]` ensures each card is wide enough to show a full roster table without cramped columns. `flex-1` lets it grow to fill remaining space, preventing large gaps on the last row. Two cards fit side-by-side on screens ≥1240px. |
| Gap | `gap-3` | Matches the spacing of the current `space-y-3`. Tailwind's `gap` on flex applies both row and column gaps symmetrically. |
| Padding removal | Remove `pl-1` from container | The `pl-1` was a minor indent. With side-by-side cards this indent creates uneven left/right margins on the first card. Removing it makes the roster cards align flush with the owner section's border radius. |

No alternatives were seriously considered — the change is deliberately minimal.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| [Overcrowding] If an owner has many rosters, they could fill the row edge-to-edge. | `min-w-[620px]` prevents cards from shrinking below readability. If a row fills completely, the next card wraps naturally. |
| [Last-row stretch] With `flex-1`, a single-card last row stretches full width, looking odd. | The card looks fine at full width — same as today's single-column layout. No visual regression. |
| [Narrow viewport] On small screens, `min-w-[620px]` could cause horizontal overflow. | Flex-wrap handles this: if the container is narrower than 620px + padding, the card overflows. The responsive fallback `w-full sm:min-w-[620px] sm:flex-1` ensures single-column on mobile by setting full width below the `sm:` breakpoint (640px). |
