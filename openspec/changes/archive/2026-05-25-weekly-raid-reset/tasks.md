## 1. Schema & Migration

- [x] 1.1 Add `completed boolean not null default false` column to `character_raids` table in schema
- [x] 1.2 Push migration to local database

## 2. Reset API

- [x] 2.1 Create `POST /api/reset` endpoint with `X-API-KEY` validation using `timingSafeEqual`
- [x] 2.2 Reset endpoint does `UPDATE character_raids SET completed = false`
- [x] 2.3 Add `RESET_API_KEY` to .env

## 3. Completion Toggle API

- [x] 3.1 Add `PATCH /api/characters/[characterId]/raids` — body `{ raidDifficultyId, completed }` flips `completed` flag on `character_raids`; authorize that `character → roster → userId` matches session
- [x] 3.2 Create Drizzle query: `toggleRaidCompletion(characterId, raidDifficultyId, completed)`
- [x] 3.3 Validate body with Zod: `{ raidDifficultyId: z.string(), completed: z.boolean() }`

## 4. Extended Dashboard API

- [x] 4.1 Update `GET /api/dashboard` to fetch friends' rosters alongside own
- [x] 4.2 Include completion data per character per raid for current week
- [x] 4.3 Return structured response: `{ rosters: [{ owner, rosters: [...] }], summary }`
- [x] 4.4 Sort raids by minIlvl ascending in the payload

## 5. React Query Setup

- [x] 5.1 Install `@tanstack/react-query`
- [x] 5.2 Create `src/app/providers.tsx` with `QueryClientProvider`
- [x] 5.3 Wrap root layout with `Providers`

## 6. Dashboard UI Redesign

- [x] 6.1 Replace SWR with React Query (`useQuery` with `refetchInterval: 60000`)
- [x] 6.2 Replace `useSWRMutation` with `useMutation` in RaidCheckbox
- [x] 6.3 Extract types to `_types/index.ts` and components to `_compose/`
- [x] 6.4 Add collapsible owner/roster sections with `useState(true)` (closed by default)
- [x] 6.5 Add per-raid progress badges aggregated at roster level (RosterSection)
- [x] 6.6 Add per-raid progress badges aggregated at owner level (OwnerSection)
- [x] 6.7 Compute Weekly Progress bar from own rosters only
- [x] 6.8 Add inline completion toggle checkbox on each raid badge/pill — disabled for non-owners
- [x] 6.9 Show compact character rows with class, item level, and raid badges
- [x] 6.10 Handle loading and empty states with Skeleton

## 7. Verify

- [x] 7.1 Test completion toggle (check/uncheck) persists correctly
- [x] 7.2 Test reset endpoint with valid and invalid API keys
- [x] 7.3 Test dashboard shows own and friends' rosters
- [x] 7.4 Verify build passes with `pnpm build`
