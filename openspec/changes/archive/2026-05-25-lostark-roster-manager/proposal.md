## Why

Lost Ark players manage multiple rosters (groups of characters) across raids and weekly lockouts. Currently there's no dedicated tool to track roster-wide raid progress across friends, leading to coordination friction and missed lockouts. This change builds a full-stack application to solve that.

## What Changes

- New Next.js web application with PostgreSQL (Supabase production, Docker Compose local)
- User authentication via Google or Discord OAuth
- Roster management (CRUD) — each user can own multiple rosters
- Character management (CRUD) per roster — each roster can hold N characters
- Friend system with request/accept/reject flow
- Dashboard showing raid completion progress across own rosters and friends' rosters
- Drizzle ORM for database layer

## Capabilities

### New Capabilities
- `user-auth`: OAuth authentication (Google + Discord), session management, user profile
- `friend-system`: Friend requests (send/accept/reject), friend list, unfriend
- `roster-management`: Create, read, update, delete rosters belonging to a user
- `character-management`: Create, read, update, delete characters within a roster
- `raid-tracking`: Define raids, track completion status per character per week
- `dashboard`: Aggregated view of own and friends' raid progress

### Modified Capabilities
<!-- No existing capabilities — this is a greenfield project. -->

## Impact

- Greenfield project — no impact on existing code
- New dependencies: Next.js, Drizzle ORM, Supabase client, NextAuth.js v5, PostgreSQL
- New infrastructure: Docker Compose for local PostgreSQL, Supabase project for production
