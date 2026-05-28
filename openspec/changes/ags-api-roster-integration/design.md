## Context

Users manually create rosters and characters by typing names, selecting classes, and entering item levels. This is disconnected from the actual game state. The ags.lol API provides a public REST API that returns real Lost Ark roster data (characters, classes, item levels, combat power) by querying a single character name + region.

The project already uses axios and has an HTTP client pattern (`src/lib/api.ts`). The external API requires an `x-api-key` header. Since this is a public API consumed server-side (not from the browser), the API key stays safe in the backend.

## Goals / Non-Goals

**Goals:**
- Add env var `AGS_API_KEY` for the external API auth
- Create an ags.lol API client module (`src/lib/ags-api.ts`) with two methods: `getCharacterByName(region, name)` and `getRosterByGuid(guid)`
- Extend the DB schema: `characters` gets `characterGuid` (text, unique), `rosters` gets `rosterGuid` (text)
- Add class mapping (`src/lib/ags-class-map.ts`) from API class names to `LostArkClass` enum, with a fallback for unknown classes
- Add a server-side API route `POST /api/rosters/:id/characters/preview` that: accepts `{ region, characterName }`, calls the ags.lol API twice (character → roster), returns the roster preview with all characters (no persistence)
- Add an "Import Characters" button on the roster detail page that opens a modal
- The modal has: region input (text, default "NA"), character name input, "Search" button → loads roster preview with character cards (class icon, name, item level) and checkboxes
- Users can select which characters to add to the current roster
- On confirm, a bulk insert via `POST /api/rosters/:id/characters/bulk` adds the selected characters to the existing roster, skipping any that already exist (matched by `characterGuid`)
- Legacy rosters without `rosterGuid` still work (nullable)
- Manual character creation is preserved alongside the import flow

**Non-Goals:**
- Editing imported character data (name, class, item level) — those come from the API and are read-only
- Auto-refreshing roster data from the API (future concern)
- Rate limiting / caching of the external API (minimal usage expected)
- Combat power display in the UI (the data is available but unused for now)

## Decisions

1. **Server-side proxy API route vs direct browser-to-API calls** — Server-side proxy (`/api/rosters/import`) keeps the API key secret and avoids CORS issues. The browser never sees the API key.

2. **Two-step API flow (character → roster) vs single lookup** — The ags.lol API requires a character name + region to find the roster; then the roster GUID returns all characters. Both calls are made server-side in the import API route.

3. **Modal on roster detail page vs roster list page** — The import is a per-roster action (adds characters to an existing roster), so the button lives on the roster detail page, not the list page.

4. **Checkbox-based character selection vs import-all** — Some users may not want every alt imported, especially if they have many. Checkboxes give control.

5. **No roster name field** — Since we're adding to an existing roster (not creating a new one), no roster name input is needed.

6. **Nullable rosterGuid/characterGuid** — Existing manual rosters should continue working. Imported characters get a guid. The schema uses nullable text columns.

7. **Duplicate prevention via characterGuid** — If a character with the same `characterGuid` already exists in the roster, it is skipped during bulk import (idempotent).

## Risks / Trade-offs

- **[Risk]** ags.lol API is a third-party service with no SLA. If down, import is unavailable. → **Mitigation**: Manual character creation remains as a fallback.
- **[Risk]** Class mapping may be incomplete — the API could add new classes before we update the enum. → **Mitigation**: Unknown classes fall back to a sensible default (e.g., Striker) and log a warning. We can fix mappings in a subsequent change.
- **[Risk]** The API may rate-limit us. → **Mitigation**: Low expected traffic; if it becomes an issue, add a simple in-memory cache (e.g., Map with TTL).
- **[Risk]** Duplicate imports could create duplicate characters. → **Mitigation**: Dedup by `characterGuid` — skip if already exists in the roster.
- **[Risk]** item_level in the current schema is `integer` but the API returns decimal values. → **Mitigation**: Store as `double precision` or `numeric`. The API returns values like `1758.3334`.
