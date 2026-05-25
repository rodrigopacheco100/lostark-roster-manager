## Context

The app currently has zero reusable components — every page duplicates the same card, button, input, and badge patterns with raw Tailwind utilities. Dark mode uses OS preference only, background is #0a0a0a (low contrast), and `tailwind.config.ts` has no custom theme tokens. The sidebar is a simple link list with no icons or visual hierarchy. Every fresh database starts empty — users must manually type the same 20+ known Lost Ark raids. The friend system has no unique identifier for users, allows duplicate pending requests, and the bidirectional friendship query returns duplicate entries. This makes visual inconsistencies easy to introduce and slows development of new pages.

## Goals / Non-Goals

**Goals:**
- Create a set of reusable UI primitives: Button, Input, Card, Badge, Modal, Select, Skeleton, EmptyState, PageHeader
- Replace all inline patterns across existing pages with shared components
- Define a custom Tailwind theme with design tokens (background #181818, semantic colors, spacing)
- Enable `darkMode: "class"` for explicit dark mode control (default to dark)
- Improve readability with better contrast ratios in dark mode
- Redesign sidebar with Lucide icons, section headers (Roster Management / Social), and logout at bottom
- Add subtle transitions (hover, focus, enter) for a modern feel
- Add EmptyState component for pages with no data
- Add PageHeader component for consistent page title + action layout
- Increase visual hierarchy: cards use elevated surfaces, nested elements use stepped backgrounds
- Create Drizzle seed script with Lost Ark raids and their difficulties
- Add unique friend code per user (generated on sign-up)
- Add "Add Friend" modal with friend code display, copy, and lookup
- Prevent duplicate friend requests and list only non-connected users in search
- Store friendships bidirectionally for simple queries
- Differentiate sent vs received requests in UI (Cancel vs Accept/Decline)

**Non-Goals:**
- No dark/light mode toggle component (defaults to dark, no light mode switch in this change)
- No responsive sidebar collapse (the sidebar stays w-64 for now)
- No complex animation library (CSS transitions only, no Framer Motion)
- No user-facing seed UI — seed is a CLI script for dev/setup only

## Decisions

- **`darkMode: "class"` over `"media"`**: Gives explicit control without relying on OS preference. `<html class="dark">` is set in root layout by default.
- **Component composition over configuration objects**: Each component (Button, Card, etc.) is a standalone React component with typed props, not a monolithic config-driven system. Easier to tree-shake and type-check.
- **`cva` (class-variance-authority) for component variants**: Lightweight (1.8kB), Tailwind-native variant system for Button (variant/size), Badge (color), etc. No runtime CSS-in-JS overhead.
- **Lucide React for icons**: Lightweight (tree-shakeable), consistent stroke-based icons, widely adopted. Used for sidebar nav items, empty states, and action buttons.
- **Components in `src/components/ui/`**: Standard colocation pattern, one file per component with named exports.
- **#181818 as base background**: Slightly lighter than #0a0a0a for better readability while staying dark. Surfaces use stepped tones (#1e1e1e, #252525, #2a2a2a) for depth.
- **Custom accent colors in tailwind.extend**: Define primary (blue), success (green), danger (red), warning (amber) as explicit tokens for consistency across components.
- **Seed script runs via `tsx`**: Already a devDependency. Script `src/db/seed.ts` directly imports Drizzle schema and inserts raids/difficulties in a transaction.
- **Seed is idempotent**: Uses existing check (`findFirst` + skip) so it can be safely re-run.
- **Refactor pages incrementally**: Component replacement is done page-by-page in a predictable order (layout → dashboard → rosters → characters → raids → friends → profile) to keep changes reviewable.
- **Friend code as `FC{Date.now()}`**: Simple, unique, human-readable. Stored as `friend_code` (text, NOT NULL, UNIQUE). Generated at user creation in the auth callback.
- **Bidirectional friendship rows**: On accept, insert both `(A, B)` and `(B, A)`. Query only by `friendships.userId`. Delete both rows on unfriend. Avoids duplicates in the list endpoint.
- **Duplicate prevention**: POST `/api/friends/request` checks for existing pending requests (both directions) and existing friendships before inserting. Returns 409 on conflict. Search query (`searchUsers`) excludes users with pending requests or existing friendships via subqueries.
- **Sent vs received differentiation**: Frontend compares `currentUser.id` with `req.sender.id` — shows Cancel for sent, Accept/Decline for received. Description text changes accordingly ("Friend request sent" vs "wants to be your friend").

## Risks / Trade-offs

- **Adding `cva` dependency** → Small (1.8kB), widely adopted, no runtime cost.
- **Adding `lucide-react` dependency** → Tree-shakeable, <10kB typical bundle impact.
- **Widespread page changes increase merge conflict surface** → Mitigation: component creation and page refactoring are separate task groups; components are created first, then pages are updated one at a time.
- **Dark mode via class may flash unstyled content on first paint** → Mitigation: inline `<script>` in root layout `<head>` sets `document.documentElement.classList.add('dark')` before paint.
- **Seed data may drift from game patches** → Mitigation: seed is a single source of truth; easy to update and re-run. Consider a future admin UI for raid management if drift becomes frequent.
- **Bidirectional friendship rows double storage** → Trivial for expected scale (<10k users). Simplifies queries significantly (no OR conditions needed).
