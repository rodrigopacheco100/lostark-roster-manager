## Why

The current UI uses raw Tailwind utilities repeated across every page with no shared components, making the interface inconsistent and hard to maintain. The dark mode relies on OS preference, and the background color (#0a0a0a) lacks contrast. Additionally, the navigation is basic, pages lack visual hierarchy, and there is no database seed — every new environment starts with zero raid data, forcing manual entry of the same known Lost Ark raids. The friend system lacks a unique friend code for each user, allowing duplicate requests and listing friendships inconsistently.

## What Changes

- Define a custom Tailwind theme with design tokens (background #181818, semantic colors, typography)
- Enable `darkMode: "class"` for manual dark mode control
- Create reusable UI components: Button, Input, Card, Badge, Modal, Select, Skeleton, EmptyState, PageHeader
- Replace all inline JSX patterns across pages with the shared components
- Apply #181818 as the dark background across all surfaces
- Improve contrast and readability in dark mode
- Add subtle transitions and hover effects for a modern feel
- Redesign sidebar with icons, section headers, and logout at bottom
- Add EmptyState component with illustration for pages with no data
- Add PageHeader component with title + action slot for consistent page top
- Create Drizzle seed script (`src/db/seed.ts`) with all Lost Ark raids and difficulties
- Add `db:seed` script to package.json
- Improve card and list item visual hierarchy with elevated surfaces
- Add `friendCode` column to users (unique, generated on sign-up via `Date.now()`)
- Add "Add Friend" modal with friend code display, copy, and lookup by code
- Prevent duplicate friend requests (server-side 409) and filter already-connected users from search
- Store friendships bidirectionally (two rows per friendship) for simple single-direction queries
- Show Cancel button for sent requests, Accept/Decline for received requests

## Capabilities

### New Capabilities
- `component-library`: Reusable UI primitives (Button, Input, Card, Badge, Modal, Select, Skeleton, EmptyState, PageHeader) with consistent styling
- `theme-styling`: Custom Tailwind theme with design tokens, dark mode configuration, and global CSS refinements
- `raid-seed`: Database seed script with all Lost Ark raids and their difficulties
- `friend-system`: Friend code generation, lookup by code, Add Friend modal, duplicate prevention, bidirectional friendship storage

### Modified Capabilities
<!-- No existing spec-level behavior changes -->

## Impact

- `tailwind.config.ts` — extended theme with custom colors, darkMode config
- `src/app/globals.css` — updated CSS variables, #181818 background, transitions, scrollbar styling
- `src/app/layout.tsx` — may need minor structural adjustments
- `src/app/(dashboard)/layout.tsx` — sidebar redesign with icons, active state, improved layout
- All page files under `src/app/` — replace inline patterns with shared components
- `src/db/seed.ts` — new seed script
- `package.json` — add `db:seed` script
- `src/db/schema/index.ts` — add `friendCode` column to users table
- `src/lib/auth.ts` — generate friendCode on user creation
- `src/lib/queries.ts` — searchUsers excludes existing friends/pending requests
- `src/app/api/friends/` — new by-code route, duplicate prevention on request, bidirectional friendship
- `src/app/(dashboard)/friends/page.tsx` — Add Friend modal with copy/lookup, cancel sent requests
- `src/app/(dashboard)/profile/page.tsx` — display friend code
- New dependencies: `class-variance-authority`, `lucide-react`, `dotenv` (seed)
