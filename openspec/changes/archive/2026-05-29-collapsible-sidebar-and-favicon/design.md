## Context

The sidebar (`src/components/Sidebar.tsx`) is a client component rendered in the dashboard layout. It uses `usePathname()` for active link detection and `lucide-react` for icons. Current width is fixed at `w-64` (256px). The layout uses `flex h-screen overflow-hidden` with the sidebar on the left and a scrollable main area.

The project uses Tailwind CSS for styling with a dark theme. No tooltip library is currently included.

`favicon.png` exists at the project root but is not referenced anywhere — Next.js does not serve it there.

## Goals / Non-Goals

**Goals:**
- Sidebar collapses to icon-only mode (tooltip on hover) with a smooth width transition
- Toggle button positioned at the top right of the sidebar
- Collapsed width ~64px (`w-16`) — just enough for icons
- Spacing/padding of icons stays identical between modes for a seamless transition
- Collapsed state persisted in localStorage across sessions
- `favicon.png` placed correctly and served in the browser tab

**Non-Goals:**
- Not a responsive/mobile sidebar — this is a desktop toggle
- No animation library beyond Tailwind's built-in transitions
- No drag-to-resize functionality
- No keyboard shortcuts for toggle (beyond the button)

## Decisions

1. **State persistence via localStorage** — The collapsed state is remembered across sessions. A simple `useState` initialized from `localStorage` with a `useEffect` to persist changes. No server-side state needed since this is purely a UI preference.

2. **Width transition with Tailwind** — The sidebar uses `w-64` expanded, `w-16` collapsed. Tailwind's `transition-all duration-300` on the nav element provides a smooth animated resize. The main area flexbox will naturally reflow thanks to `flex-1`.

3. **Tooltips via CSS-only approach** — Each nav link renders a tooltip on hover when collapsed. Using a positioned `<span>` with `group-hover:opacity-100` avoids adding a dependency. The tooltip appears to the right of the icon with a small offset.

4. **Toggle button icon** — A `PanelLeftClose` / `PanelLeftOpen` from lucide-react, positioned at the top right of the sidebar using absolute positioning within the sidebar's relative container.

5. **Favicon placement** — `favicon.png` is moved to `src/app/favicon.png`. Next.js 14 App Router automatically serves `app/favicon.ico` and `app/favicon.png`. No metadata change needed for basic setup, but adding it explicitly to the `Metadata` export in `layout.tsx` ensures clarity.

## Risks / Trade-offs

- [Smooth transition] Width transition may feel janky if the main content area has complex layout recalculations → Mitigation: apply `transition-all duration-300` only to the sidebar nav, and use `shrink-0` on the sidebar wrapper.
- [CSS tooltip positioning] Tooltips could clip at the bottom of the viewport → Mitigation: use a simple top-aligned tooltip, accept minor clipping at extremes (rare in desktop use).
- [localStorage failure] SSR hydration mismatch if localStorage is unavailable → Mitigation: initialize state with `false` and only read from localStorage in `useEffect`.
