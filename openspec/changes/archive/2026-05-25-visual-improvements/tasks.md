## 1. Theme & Tailwind Setup

- [x] 1.1 Add `class-variance-authority` and `lucide-react` dependencies to package.json
- [x] 1.2 Configure `darkMode: "class"` in tailwind.config.ts
- [x] 1.3 Add custom color tokens to tailwind.config.ts (surface, surface-elevated, surface-hover, primary, success, danger, warning)
- [x] 1.4 Update globals.css: set #181818 as default background, refine CSS variables, add transition defaults, style scrollbar
- [x] 1.5 Add inline script to root layout `<head>` to set `dark` class before paint
- [x] 1.6 Set `<html class="dark">` in root layout

## 2. Create UI Components

- [x] 2.1 Create `src/components/ui/Button.tsx` with variant (primary/secondary/danger/ghost) and size (sm/md/lg) using cva, with icon prop
- [x] 2.2 Create `src/components/ui/Input.tsx` with label, error, and placeholder props
- [x] 2.3 Create `src/components/ui/Card.tsx` with surface background #1e1e1e, hover elevate, consistent padding
- [x] 2.4 Create `src/components/ui/Badge.tsx` with color variant prop (blue/green/red/gray/yellow)
- [x] 2.5 Create `src/components/ui/Modal.tsx` with overlay, title, close on Escape/overlay click
- [x] 2.6 Create `src/components/ui/Select.tsx` with label, options array, and error support
- [x] 2.7 Create `src/components/ui/Skeleton.tsx` with width, height, rounded props
- [x] 2.8 Create `src/components/ui/EmptyState.tsx` with icon, title, description, optional action
- [x] 2.9 Create `src/components/ui/PageHeader.tsx` with title and optional action slot
- [x] 2.10 Create `src/components/ui/index.ts` barrel export for all components

## 3. Redesign Dashboard Layout & Sidebar

- [x] 3.1 Restructure sidebar with Lucide icons (LayoutDashboard, Sword, Swords, Users, UserCircle, LogOut)
- [x] 3.2 Add section headers \"Roster Management\" (Dashboard, Rosters, Raids) and \"Social\" (Friends, Profile)
- [x] 3.3 Move Sign Out button to the bottom of the sidebar, separated with a divider
- [x] 3.4 Add active-state highlighting using `usePathname()` with surface color and accent text
- [x] 3.5 Apply new theme tokens to sidebar (bg #1e1e1e, hover #252525, active #2a2a2a)
- [x] 3.6 Replace inline button/link patterns with shared Button component

## 4. Create Database Seed Script

- [x] 4.1 Create `src/db/seed.ts` importing db and schema
- [x] 4.2 Define all Lost Ark raids with their difficulties and min ilvls:
- [x] 4.3 Use `db.insert(raids).values(...).onConflictDoNothing()` for idempotency
- [x] 4.4 Wrap all inserts in a transaction for atomicity
- [x] 4.5 Add `"db:seed": "tsx src/db/seed.ts"` to package.json scripts
- [x] 4.6 Run seed against local DB and verify data

## 5. Refactor Pages with Shared Components

- [x] 5.1 Update dashboard page (`/dashboard`) — replace inline cards with Card component, replace buttons with Button, add Skeleton for loading
- [x] 5.2 Update sign-in page (`/auth/signin`) — replace buttons with Button
- [x] 5.3 Update rosters page (`/rosters`) — replace buttons, inputs, cards with shared components, add EmptyState when no rosters
- [x] 5.4 Update roster detail page (`/rosters/[id]`) — replace all inline patterns
- [x] 5.5 Update raids page (`/raids`) — replace buttons, badges, inputs with shared components
- [x] 5.6 Update friends page (`/friends`) — replace buttons, cards, inputs with shared components, add EmptyState when no friends
- [x] 5.7 Update profile page (`/profile`) — replace buttons with Button component

## 6. Polish & Verify

- [x] 6.1 Remove any `<html>` or `<body>` style attributes that conflict with new theme
- [x] 6.2 Verify all interactive states (hover, focus, active, disabled) have smooth transitions
- [x] 6.3 Verify build passes with `pnpm build`
- [x] 6.4 Verify dark background #181818 renders correctly across all pages
- [x] 6.5 Verify sidebar icons render and active state highlights correct route
- [x] 6.6 Verify seed runs successfully with `pnpm db:seed`

## 7. Friend Code & Friendship Improvements

- [x] 7.1 Add `friendCode` column to users table (text, notNull, unique)
- [x] 7.2 Generate `FC${Date.now()}` in auth signIn callback on user creation
- [x] 7.3 Backfill existing users with friend codes based on created_at
- [x] 7.4 Create GET /api/user/me route returning full user with friendCode
- [x] 7.5 Create GET /api/friends/by-code route to look up user by friend code
- [x] 7.6 Display friend code on profile page
- [x] 7.7 Add "Add Friend" button in PageHeader on /friends page opening a Modal
- [x] 7.8 Modal shows own friend code with Copy button, separator, and lookup input
- [x] 7.9 Prevent duplicate friend requests (409 on existing pending/friendship)
- [x] 7.10 Exclude connected users from friend search via subqueries
- [x] 7.11 Store friendships bidirectionally (two rows per friendship)
- [x] 7.12 Query friends list by single-direction filter (no duplicates)
- [x] 7.13 Show Cancel for sent requests, Accept/Decline for received
