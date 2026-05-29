## Why

The sidebar takes up significant horizontal space with full link labels, which is unnecessary once users are familiar with the navigation. A collapsible mode (icons only) frees up screen real estate while maintaining quick access. The app also lacks a favicon in the browser tab.

## What Changes

- Add a toggle button at the top right of the sidebar to collapse/expand it
- When collapsed, sidebar shows only icons with tooltips (no labels)
- Maintain same icon spacing for smooth animated transition
- Move `favicon.png` to the correct Next.js location and register it in metadata

## Capabilities

### New Capabilities
- `collapsible-sidebar`: Responsive sidebar that toggles between expanded (labels + icons) and collapsed (icons only with tooltips) states, with smooth CSS transition
- `favicon-setup`: Correctly place and register the favicon for the browser tab

### Modified Capabilities
*(none)*

## Impact

- `src/components/Sidebar.tsx` — add toggle button, collapsible state, tooltips, conditional label rendering, width transition
- `src/app/(dashboard)/layout.tsx` — sidebar width may change dynamically; layout should adapt
- `src/app/layout.tsx` — add favicon to metadata, or move favicon.png to `src/app/` for automatic detection
- `favicon.png` — move from project root to `src/app/` (Next.js App Router convention)
