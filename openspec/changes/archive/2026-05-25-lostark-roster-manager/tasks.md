## 1. Project Setup

- [x] 1.1 Initialize Next.js project with App Router, TypeScript, Tailwind CSS (use `npx create-next-app@latest` and accept LTS defaults)
- [x] 1.2 Lock all dependency versions to their LTS releases (Node.js 22 LTS, Next.js 14/15 LTS track, Drizzle, NextAuth.js v5, Zod, SWR, PostgreSQL client)
- [x] 1.3 Configure Docker Compose for local PostgreSQL
- [x] 1.4 Set up Drizzle schema directory and database connection config
- [x] 1.5 Create initial Drizzle migration and apply to local DB
- [x] 1.6 Configure environment variables (.env, .env.local) for DB and OAuth

## 2. Database Schema

- [x] 2.1 Define `users` table (id, name, email, avatar, googleId, createdAt)
- [x] 2.2 Define `rosters` table (id, name, userId, createdAt)
- [x] 2.3 Define `characters` table (id, name, class, itemLevel, rosterId, createdAt)
- [x] 2.4 Define `friend_requests` table (id, senderId, receiverId, status, createdAt)
- [x] 2.5 Define `friendships` table (id, userId, friendId, createdAt)
- [x] 2.6 Define `raids` table (id, name, resetDay, userId, createdAt)
- [x] 2.7 Define `raid_completions` table (id, raidId, characterId, weekStart, completed, createdAt)
- [x] 2.8 Define Drizzle relations between all tables
- [x] 2.9 Generate and apply Drizzle migrations

## 3. Authentication (OAuth)

- [x] 3.1 Set up NextAuth.js v5 configuration with Google provider
- [x] 3.2 Removed database adapter — JWT-only, no sessions/accounts/verification tokens in DB
- [x] 3.3 Create sign-in page with "Sign in with Google" and "Sign in with Discord" buttons
- [x] 3.4 Create auth API route handlers (sign in, sign out, session)
- [x] 3.5 Add auth middleware to protect authenticated routes
- [x] 3.6 Create user profile page (display name, avatar, sign out)
- [x] 3.7 Add Discord provider — dynamic signIn callback maps provider to `googleId` or `discordId` column
- [x] 3.8 Add `discord_id` column to users table (nullable, unique), make `google_id` nullable

## 4. Roster Management

- [x] 4.1 Create Drizzle queries for roster CRUD
- [x] 4.2 Build API routes: GET /api/rosters, POST /api/rosters
- [x] 4.3 Build API routes: PUT /api/rosters/[id], DELETE /api/rosters/[id]
- [x] 4.4 Build roster list page with create/edit/delete UI
- [x] 4.5 Add Zod validation schemas for roster operations

## 5. Character Management

- [x] 5.1 Create Drizzle queries for character CRUD
- [x] 5.2 Build API routes: GET /api/rosters/[id]/characters, POST /api/rosters/[id]/characters
- [x] 5.3 Build API routes: PUT /api/characters/[id], DELETE /api/characters/[id]
- [x] 5.4 Build character list UI within roster detail page
- [x] 5.5 Create character add/edit form with class dropdown and item level input
- [x] 5.6 Add Zod validation schemas for character operations

## 6. Friend System

- [x] 6.1 Create Drizzle queries for friend requests and friendships
- [x] 6.2 Build API route to search users by name/email
- [x] 6.3 Build API routes: POST /api/friends/request, PUT /api/friends/request/[id]
- [x] 6.4 Build API routes: GET /api/friends, DELETE /api/friends/[id]
- [x] 6.5 Build friends page with friend list, search, and pending requests UI
- [x] 6.6 Add friend request notification indicator in navigation

## 7. Raid Tracking

- [x] 7.1 Create Drizzle queries for raid templates and completions
- [x] 7.2 Build API routes: CRUD for raid templates
- [x] 7.3 Build API routes: POST /api/raids/[id]/completions, GET /api/raids/[id]/completions
- [x] 7.4 Build raid management UI (create raid template, configure reset day)
- [x] 7.5 Build per-character raid completion checklist UI
- [x] 7.6 Implement weekly reset logic (cron job or on-access check)
- [x] 7.7 Add Zod validation schemas for raid operations

## 8. Dashboard

- [x] 8.1 Create API route: GET /api/dashboard — aggregated own progress
- [x] 8.2 Create API route: GET /api/dashboard/friends — aggregated friends' progress
- [x] 8.3 Build main dashboard UI with roster-level breakdown and completion percentages
- [x] 8.4 Build friends' progress section on dashboard with collapsible friends
- [x] 8.5 Add SWR polling (60s) for auto-refresh on dashboard
- [x] 8.6 Build read-only friend roster detail view (modal or inline expand)

## 9. Polish & Finalize

- [x] 9.1 Add responsive layout and navigation (sidebar or top nav)
- [x] 9.2 Add loading states and error handling to all data-fetching views
- [x] 9.3 Test complete flows: auth → create roster → add characters → add friend → view dashboard
- [x] 9.4 Test weekly reset behavior
- [x] 9.5 Write README with setup instructions (Docker Compose, env vars, DB setup)
- [x] 9.6 Verify linting and type-checking pass
