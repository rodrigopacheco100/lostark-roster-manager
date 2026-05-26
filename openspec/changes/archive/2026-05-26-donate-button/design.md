## Context

The sidebar currently has navigation links, then a sign-out button at the bottom. We'll add a "Buy Me a Coffee" link between the nav links and the sign-out divider. No external dependencies needed — just an `<a>` tag with `target="_blank"` and `rel="noopener noreferrer"`.

## Goals / Non-Goals

**Goals:**
- Add a visible donate link in the sidebar
- Link opens in a new tab
- Match the existing sidebar styling

**Non-Goals:**
- Tracking or analytics for clicks
- Alternative payment platforms
- In-app donation flow (redirects to external site)

## Decisions

1. **Simple `<a>` tag with external icon** — No new component, no external UI library. Uses `Coffee` icon from lucide-react (already a dependency).
2. **Positioned above sign-out, below nav** — Visible but not intrusive. Separated by the existing border.
3. **`target="_blank" rel="noopener noreferrer"`** — Security best practice for external links.

## Risks / Trade-offs

- No risk — minimal change, no dependencies, trivially revertible.
