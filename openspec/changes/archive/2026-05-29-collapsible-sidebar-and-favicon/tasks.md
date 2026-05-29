## 1. Favicon Setup

- [x] 1.1 Move `favicon.png` from project root to `src/app/favicon.png`
- [x] 1.2 Add `icons` property to the `metadata` export in `src/app/layout.tsx` referencing the favicon

## 2. Sidebar Collapsible State

- [x] 2.1 Add `useState` for collapsed state in `Sidebar.tsx`, initialized from `localStorage` with `false` as default
- [x] 2.2 Add `useEffect` to persist collapsed state to `localStorage` on change
- [x] 2.3 Add toggle button positioned on the right edge of the sidebar (outside the nav, like a tab handle)
- [x] 2.4 Apply width transition classes to the sidebar nav: `transition-all duration-300`, conditional `w-64`/`w-20`
- [x] 2.5 Replace conditional rendering with `CollapsibleText` component (max-width + opacity transition) for all text labels, group labels, "Buy me a coffee" text, and "Sign out" text
- [x] 2.6 Add CSS tooltip to each nav link item that appears on hover when collapsed
- [x] 2.7 Add tooltip to "Sign out" button and "Buy me a coffee" link when collapsed
- [x] 2.8 Add favicon to brand section, transitioning between `h-6 w-6` (expanded) and `h-4 w-4` (collapsed)
- [x] 2.9 Add separator between nav menu groups (`border-t border-gray-700`)
- [x] 2.10 Initialize sidebar state from localStorage on first render to prevent transition on page load
