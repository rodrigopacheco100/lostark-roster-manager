# Lost Ark Roster Manager

Full-stack application for tracking raid progress across Lost Ark rosters and friends.

## Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript, Tailwind CSS)
- **Database**: PostgreSQL (Docker Compose for local, Supabase for production)
- **ORM**: Drizzle
- **Auth**: NextAuth.js v5 (Auth.js) with Google OAuth
- **Validation**: Zod
- **Data Fetching**: SWR for client-side polling

## Prerequisites

- Node.js 22 LTS
- pnpm 11+
- Docker + Docker Compose

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start local PostgreSQL

```bash
docker compose up -d
```

### 3. Configure environment variables

Copy `.env` and fill in the values:

```bash
cp .env .env.local
```

Required variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (default: `postgresql://lostark:lostark@localhost:5432/lostark_roster`) |
| `AUTH_SECRET` | NextAuth secret (generate with `openssl rand -base64 32`) |
| `AUTH_GOOGLE_ID` | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret |
| `AUTH_URL` | App URL (default: `http://localhost:3000`) |

### 4. Push database schema

```bash
pnpm db:push
```

### 5. Start dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable the **Google+ API** / **OAuth consent screen**
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy the Client ID and Client Secret to `.env.local`

## Commands

| Command | Description |
|---|---|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm db:generate` | Generate Drizzle migration |
| `pnpm db:push` | Push schema to database |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript check |

## Project Structure

```
src/
├── app/
│   ├── (auth)/signin/        # Sign-in page
│   ├── (dashboard)/          # Authenticated routes (layout with sidebar)
│   │   ├── dashboard/        # Main dashboard — roster & raid summaries
│   │   ├── rosters/          # Roster management
│   │   │   └── [id]/         # Character management + raid assignment
│   │   ├── friends/          # Friend management
│   │   ├── raids/            # Global raid + difficulty management
│   │   └── profile/          # User profile
│   ├── api/                  # API routes
│   │   ├── auth/             # NextAuth handlers
│   │   ├── rosters/          # Roster CRUD
│   │   ├── characters/       # Character CRUD + raid assignment
│   │   ├── friends/          # Friend system
│   │   ├── raids/            # Global raids + difficulties
│   │   └── dashboard/        # Aggregated progress data
│   └── page.tsx              # Landing page
├── db/
│   ├── schema/index.ts       # Drizzle table definitions (11 tables)
│   └── index.ts              # Database client
└── lib/
    ├── auth.ts               # NextAuth configuration
    ├── queries.ts            # Drizzle query helpers
    └── validations.ts        # Zod schemas
```
