## Context

The app already integrates with the AGS API (`src/lib/ags-api.ts`) for roster import. Rosters store `rosterGuid` and characters store `characterGuid` when imported. There are two existing flows:

- **New roster import** (`ImportRosterModal`): creates a roster + inserts characters from AGS
- **Add characters** (`AddRosterCharactersModal`): adds more characters to an existing linked roster

Neither flow updates existing characters' item levels. Over time, characters' ilvls in the app diverge from AGS as players hone gear. There is also no visual indicator on the `/rosters` list page to distinguish linked vs unlinked rosters.

This change adds two features on top of the existing AGS integration: a visual badge for linked rosters, and a bulk ilvl sync button with a 1-hour cooldown.

## Goals / Non-Goals

**Goals:**
- Show an AGS-linked badge on roster cards in `/rosters` page when `rosterGuid` is set
- Add a "Sync ilvl" button on `/rosters` that updates all characters' item levels from AGS for linked rosters
- Enforce a 1-hour cooldown using localStorage, with a visual timer
- Use existing `getRosterByGuid` + `getCharacterByName` from ags-api.ts — no new AGS endpoints

**Non-Goals:**
- No per-character ilvl sync (always syncs all characters in all linked rosters)
- No server-side rate limiting (client-only via localStorage)
- No changes to roster detail page (the sync is from the list page)
- No changes to the AGS API client itself
- No background/automatic sync — always user-triggered

## Decisions

**1. Single "Sync ilvl" button on /rosters page (not per-roster)**

A single button syncs all linked rosters' characters at once. This is simpler UX than per-roster buttons and matches user expectation of "refresh everything." Each roster is fetched sequentially via `getRosterByGuid`.

**2. New API route `/api/rosters/sync-ilvl`**

A POST endpoint that:
1. Reads all rosters for the user with `rosterGuid` set
2. For each roster, calls `getRosterByGuid(guid)` to get current data
3. Matches characters by `characterGuid` (not by name — GUIDs are stable)
4. Updates `itemLevel` in the `characters` table where the GUID matches
5. Returns count of updated characters

Keeps the AGS API call server-side (existing pattern), avoids exposing the API key.

**3. localStorage for cooldown (not server-side)**

The cooldown key: `ags:ilvl-sync:last-sync-ts` → ISO timestamp of last successful sync. On page load and after sync, check if 1 hour has passed. The button is disabled during cooldown and shows remaining time. Server does not enforce this — it's purely UX to avoid excessive API calls.

**4. Badge uses a simple SVG icon (no new dependencies)**

A small AGS-style icon (or chain-link icon) next to the roster name using inline SVG or a Tailwind-styled indicator. No new icon library needed.

## Risks / Trade-offs

- **[Low] Stale cooldown across tabs** — localStorage is per-origin, so same-origin tabs share it. If another tab syncs, this tab's timer updates on next render. Acceptable.
- **[Low] AGS API key missing** — if `AGS_API_KEY` is empty, the sync endpoint returns 400. The UI should still show the badge but hide/disable the sync button. Mitigation: check for env var in the route and respond gracefully.
- **[Low] Many linked rosters** — each roster requires a separate `getRosterByGuid` API call. With 10+ rosters this could be slow. Mitigation: use `Promise.allSettled` for parallel fetches, show loading state.
- **[Low] localStorage cleared** — user can sync again immediately if they clear storage. Acceptable — this is a soft cooldown, not a security measure.
