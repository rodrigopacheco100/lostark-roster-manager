## Context

Greenfield Next.js application for Lost Ark roster and raid tracking. Users authenticate with Google or Discord OAuth, manage rosters/characters, connect with friends, and view aggregated raid progress across their social graph.

## Goals / Non-Goals

**Goals:**
- All dependencies pinned to their LTS versions
- Next.js 14+ App Router full-stack architecture
- PostgreSQL with Drizzle ORM for data layer
- Google OAuth via NextAuth.js v5 (Auth.js)
- RESTful API routes under `/api/` for all data operations
- Responsive dashboard view
- Local dev with Docker Compose PostgreSQL, production on Supabase

**Non-Goals:**
- Real-time updates (no WebSockets — page refresh or SWR polling is sufficient for MVP)
- Mobile native apps (responsive web only)
- Game data API integration (raid/character data entered manually by users)
- Notifications/email (out of scope for MVP)

## Decisions

- **Next.js App Router** over Pages Router: modern patterns, server components, React Server Actions
- **Drizzle ORM** over Prisma: lighter, SQL-like API, better for custom queries
- **NextAuth.js v5 (Auth.js)** for OAuth (Google + Discord): mature, tight Next.js integration, session management; dynamic signIn callback maps provider to the correct identity column
- **Supabase PostgreSQL** for production: managed Postgres, good free tier, connection pooling
- **Docker Compose PostgreSQL** for local dev: matches production DB, easy setup
- **Server Components + Server Actions** for data fetching/mutations: reduces client bundle, colocated logic
- **SWR** for client-side polling on dashboard: lightweight, automatic revalidation
- **API routes** (`/api/...`) as server-side endpoints: traditional approach, easy to test, works with Server Actions fallback
- **Zod** for validation at API boundary: type-safe, Drizzle-compatible schemas

## Risks / Trade-offs

- **Supabase rate limits on free tier** → Mitigation: enable Row Level Security (RLS) and keep queries efficient; cache dashboard aggregations
- **Two OAuth providers increases complexity in signIn callback** → Mitigation: provider → column mapping via a lookup table (`providerField`), tested with both Google and Discord profiles
- **Manual raid data entry** → Risk of abandonment. Mitigation: auto-populate with templates for known Lost Ark raids
- **Drizzle migrations in CI** → Risk of drift. Mitigation: use `drizzle-kit push` in dev, generate SQL migrations for production
- **Users table has both googleId and discordId (nullable)** → Both columns are nullable + unique; a user linked via email can sign in with either provider and link the account
