## 1. Backend: Sync ilvl API route

- [x] 1.1 Add `updateCharacterItemLevel` query function in `src/lib/queries.ts` (update `itemLevel` by `characterGuid`)
- [x] 1.2 Create `POST /api/rosters/sync-ilvl` route that iterates linked rosters, calls `getRosterByGuid`, matches by `characterGuid`, updates `itemLevel`, returns updated count
- [x] 1.3 Handle errors: return 400 if `AGS_API_KEY` is not configured, 500 on AGS API failure

## 2. Frontend: AGS-linked badge

- [x] 2.1 In `src/app/(dashboard)/rosters/page.tsx`, add an AGS badge/icon next to roster name when `rosterGuid` is set
- [x] 2.2 Verify the badge shows correctly on linked rosters and is absent on unlinked ones

## 3. Frontend: Sync ilvl button with cooldown

- [x] 3.1 Add a "Sync ilvl" button to the `/rosters` page, visible only when there are linked rosters
- [x] 3.2 Implement localStorage cooldown logic: save timestamp on success, check on mount, disable button during cooldown, show countdown timer
- [x] 3.3 Wire button to `POST /api/rosters/sync-ilvl` with loading state and toast on success/error
- [x] 3.4 Only save cooldown timestamp on successful sync (not on error)

## 4. Verification

- [x] 4.1 Run `npm run typecheck` and fix any type errors
- [x] 4.2 Run `npm run lint` and fix any lint errors
- [x] 4.3 Start dev server and manually verify: badge appears on linked rosters, sync button works, cooldown prevents re-sync within 1 hour, timer resets after expiry
