## Why

The current dashboard has redundant header space and an outdated horizontal progress bar that clutters the top of the page. Moving a modern circular progress bar into each owner's collapse header saves vertical space and provides per-owner progress at a glance — a more useful and visually appealing experience.

## What Changes

- **Remove** the `PageHeader` component (`title="Dashboard"`) and the subtitle line from the dashboard page
- **Remove** the horizontal weekly progress `Card` (linear bar with "X/Y raids completed") from the top of the dashboard
- **Add** a circular progress bar inside each `OwnerSection` collapse header, positioned on the right side
  - Shows completion percentage inside the circle
  - Bar color transitions: gray (0%) → red (1%) → yellow (50%) → green (100%)
  - Uses CSS `conic-gradient` or SVG for the circular stroke
- The weekly progress is now scoped per-owner (visible in their collapse header) rather than shown as a single top-level metric

## Capabilities

### New Capabilities
- `dashboard-header-removal`: Remove the page header and subtitle from the dashboard page
- `circular-progress-bar`: A circular progress bar component with percentage display and color transitions per owner

### Modified Capabilities
*(None — no existing specs have their requirements changed)*

## Impact

- **Files modified:**
  - `src/app/(dashboard)/dashboard/page.tsx` — remove PageHeader, subtitle, and progress Card; remove PageHeader / Skeleton imports if no longer needed
  - `src/app/(dashboard)/dashboard/_compose/OwnerSection.tsx` — add circular progress bar in the collapse header (right side), compute per-owner completion stats
- **Files created:**
  - New `CircularProgress` component (in `src/components/ui/` or locally in `_compose/`)
- **No API changes** — the `DashboardData` type already has per-owner roster data, no new endpoints needed
