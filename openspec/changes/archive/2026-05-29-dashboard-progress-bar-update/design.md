## Context

The dashboard currently shows a global horizontal progress bar at the top using a `Card` with a `<div>`-based linear bar (blue, `width: ${pct}%`). The `PageHeader` with title "Dashboard" plus a subtitle line take up additional vertical space. Progress is computed from the current user's own rosters only.

Each `OwnerSection` (one per owner) is a collapsible with a button row (chevron, avatar, name). This is the natural place to surface per-owner progress.

## Goals / Non-Goals

**Goals:**
- Remove `PageHeader` and subtitle from `dashboard/page.tsx`
- Remove the global progress `Card` from `dashboard/page.tsx`
- Add a circular progress bar to each `OwnerSection` collapse header (right-aligned)
- Circular bar shows `N%` inside the circle
- Color gradient: `#6b7280` (gray, 0%) → `#ef4444` (red, 1%) → `#eab308` (yellow, 50%) → `#22c55e` (green, 100%)
- Per-owner progress computed from that owner's roster data

**Non-Goals:**
- No API changes — per-owner data already available in `group.rosters`
- No changes to raid toggle functionality or other dashboard sections
- No changes to other pages that use `PageHeader`
- Smooth CSS transition animation on the progress ring when percentage changes

## Decisions

1. **SVG `<circle>` with `strokeDasharray` over conic-gradient**
   - SVG is more accessible, easier to control precisely, and works consistently across browsers. A conic-gradient approach would require additional CSS and doesn't offer the same stroke-cap control.
   - The ring is drawn with `circle` elements: a background gray ring, then a colored progress ring using `strokeDasharray` / `strokeDashoffset`.

2. **Color interpolation via a helper function, not hardcoded stops**
   - A `getProgressColor(pct: number): string` function maps `0→gray`, `1-49→red-to-yellow`, `50-99→yellow-to-green`, `100→green`.
   - This gives smooth transitions rather than abrupt jumps at arbitrary thresholds.

3. **New `CircularProgress` component over inline markup**
   - A dedicated `CircularProgress` component (placed in `src/components/ui/`) keeps the SVG logic reusable and testable.
   - Props: `{ percent: number; size?: number; strokeWidth?: number }`

4. **CSS `transition` on `strokeDashoffset` for smooth animation**
   - The SVG circle's `strokeDashoffset` changes when the percentage updates. Applying `transition: stroke-dashoffset 0.6s ease` on the progress ring element animates the arc smoothly from the old value to the new one.
   - The `transition` property is set on the `<circle>` element via the className or inline style, and does not require any state management or imperative animation code.
   - This approach has zero runtime cost beyond the CSS transition itself, works declaratively with React re-renders, and does not introduce any animation library dependency.

5. **Right-aligned in the owner header button**
   - The button in `OwnerSection` is `flex w-full items-center gap-2`. Adding `justify-between` and placing the `CircularProgress` after the owner name naturally right-aligns it without extra layout wrappers.

## Risks / Trade-offs

- **[Small size on mobile]** The circle at `size=36` may be hard to read on very small screens. → Mitigation: default size is 36px; the percentage font scales down with the circle.
- **[Per-owner progress ≠ global progress]** Users lose the single "overall progress" number. → Mitigation: the owner-level view is more actionable (which owner is behind), and the sum is still visible as a mental aggregate.
