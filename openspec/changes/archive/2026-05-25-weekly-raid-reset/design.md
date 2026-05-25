## Context

The current app assigns raids to characters (up to 3 per character via `character_raids` junction table) but has no concept of weekly completion. Lost Ark resets every Wednesday — after reset, all raids can be done again. The dashboard shows only the user's own rosters. To coordinate with friends, players need a shared view of who has completed what this week.

## Goals / Non-Goals

**Goals:**
- Track weekly completion per character per assigned raid difficulty
- Toggle completion status from the UI (check/uncheck)
- Provide an external reset endpoint (`POST /api/reset`) protected by API key header
- Extend dashboard to show both own and friends' rosters with completion state
- Aggregate per-raid progress into badges at roster and owner level
- Compact, organized layout with sections collapsed by default and progress summaries

**Non-Goals:**
- No automatic cron-based reset (external webhook replaces it — can be called by a free cron service like cron-job.org or GitHub Actions)
- No completion history (reset just sets all `completed = false`)
- No gamification or streaks

## Decisions

- **`completed` boolean column on `character_raids`**: No separate table needed — we don't persist history. Each assignment row has `completed boolean not null default false`. When the user toggles, we flip this flag. Simpler queries, fewer tables.
- **Reset sets `completed = false` on all `character_raids`**: The reset endpoint does a single `UPDATE character_raids SET completed = false`. No rows created or deleted.
- **API key in env var**: `RESET_API_KEY` in `.env`. The reset endpoint compares the `X-API-KEY` header using `crypto.timingSafeEqual` to prevent timing attacks.
- **Dashboard unifies own + friends' rosters at the API level**: `GET /api/dashboard` fetches friendships via both directions, then queries rosters + characters + completions for each friend. The frontend receives `{ owner, rosters: [...] }` per group with a summary node.
- **React Query instead of SWR**: `@tanstack/react-query` with `useQuery` for fetching and `useMutation` for toggling. Dashboard auto-refreshes every 60s via `refetchInterval`. After a toggle, `invalidateQueries({ queryKey: ["dashboard"] })` triggers re-fetch.
- **Components extracted to `_compose/` and `_types/`**: Three components (`OwnerSection`, `RosterSection`, `RaidCheckbox`) and all dashboard types extracted from `page.tsx` into dedicated files under the dashboard route directory.
- **Per-raid progress badges**: Both OwnerSection and RosterSection headers display aggregated badges per raid (e.g. "3/5 Valtan (Normal)"). Computed via `useMemo` grouping by `raidName::difficulty` across all characters in that scope. Badge turns green when completed count equals total.
- **Collapses default to closed**: Both OwnerSection and RosterSection start collapsed (`useState(true)`) to reduce visual noise. Summary badges remain visible even when collapsed.
- **Weekly Progress bar is own-rosters only**: The summary bar at the top only counts raids from `rosters.find(g => g.owner.isMe)`, not friends' rosters.
- **Raids sorted by minIlvl in API payload**: Dashboard API `.sort((a, b) => a.minIlvl - b.minIlvl)` so raids appear from lowest to highest item level requirement.
- **Toggle is inline — no modal/page**: Each raid badge/pill on the dashboard has a button. Clicking calls `useMutation` PATCH with `{ raidDifficultyId: string, completed: boolean }` which flips the `completed` flag on `character_raids`. Disabled (cursor-default) if the logged user is not the character owner.
- **Authorization**: Only the owner of the character can toggle completion. The PATCH endpoint verifies `character → roster → userId` matches the session. Friends viewing the dashboard see checkboxes as read-only.

```
Data Model (only change: add `completed` to character_raids)
┌───────────────────┐    ┌───────────────────┐
│  character_raids  │    │ raid_difficulties │
├───────────────────┤    ├───────────────────┤
│ id                │    │ id                │
│ characterId       │───▶│ raidId → raids    │
│ raidDifficultyId  │    │ difficulty        │
│ completed (bool)  │    │ minIlvl           │
│ createdAt         │    └───────────────────┘
└───────────────────┘

Dashboard API Response:
{
  rosters: [
    {
      owner: { id, name, isMe: true },
      rosters: [{
        rosterId, rosterName,
        characters: [{
          id, name, class, itemLevel,
          raids: [{ characterRaidId, raidDifficultyId, raidName, difficulty, minIlvl, completed }]
        }],
        totalRaidsAssigned, totalCharacters
      }]
    }
  ],
  summary: { totalAssigned, totalCompleted }
}
```

## Risks / Trade-offs

- **Reset endpoint is unauthenticated (only API key)** → Mitigation: `timingSafeEqual` comparison, key stored in env var only. Key should be a long random string.
- **Friends with many rosters could make dashboard slow** → Mitigation: limit to direct friends (no transitive friends). Dashboard uses React Query with 60s `refetchInterval`, so it's acceptable.
- **No automatic cron means reset must be triggered externally** → Mitigation: easy to set up on cron-job.org or a simple GitHub Actions scheduled workflow hitting the reset URL.
