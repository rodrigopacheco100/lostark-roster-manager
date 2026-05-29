## Context

The project tracks raid completion per character per difficulty as a boolean flag. Users currently mark raids manually on the dashboard. Loa Logs is a local Windows app that writes encounter data to a SQLite database (`encounters.db`). The `encounter_preview` table contains entries for each boss attempt with a `local_player` field (character name), `current_boss` (boss name), `cleared` (boolean), `fight_start` (ms timestamp), and `difficulty` (text). We need to read this database and auto-populate completed raids.

## Goals / Non-Goals

**Goals:**
- Allow users to configure the path to their Loa Logs `encounters.db` file
- Query the SQLite DB for `cleared = true` entries within the current weekly window (Wed 07:00 UTC to next Wed 07:00 UTC)
- Match `local_player` to character names in the user's rosters
- Map `current_boss` names to our raid slugs using a last-gate mapping strategy
- Mark the matched raid+difficulty as `completed = true` for the character
- Provide a manual "Scan Now" button and optional auto-polling (configurable interval)
- Store user config (DB path, poll preferences) in localStorage

**Non-Goals:**
- Import from other log sources (only Loa Logs)
- Per-gate tracking (we only track raid+difficulty completion)
- Real-time file watching (polling only)
- Cross-user sharing of log data
- Historical import before the weekly reset

## Decisions

### D1: Use `better-sqlite3` for SQLite reads
`better-sqlite3` is synchronous, fast, and well-suited for reading a local file from a server-side API route. `sql.js` is an alternative but requires loading the entire DB into memory. Since this is a development/self-hosted tool, native dependencies are acceptable.

### D2: Client-side polling via `refetchInterval`
The front-end polls `/api/loa-logs/scan` using React Query's `refetchInterval` (default 10s). The API route is the single entry point: it reads the SQLite DB, applies filters, and imports. This avoids needing a server-side cron or interval, and keeps the code simple. When auto-poll is disabled, the user clicks "Scan Now" which triggers a single fetch.

### D3: Weekly window computed server-side (Wed 07:00 UTC)
The current weekly window is computed as the most recent Wednesday 07:00:00 UTC to the next Wednesday 07:00:00 UTC. `fight_start` values (ms timestamps) in the SQLite DB are filtered against this window. This matches the Lost Ark weekly reset time. No deduplication table is needed — the weekly window naturally excludes old entries, and re-running the scan for the same week is idempotent (updating `completed = true` is a no-op if already set).

### D4: Boss name mapping by last gate (stored on raids table)
Each raid's last gate boss uniquely identifies a completed raid. We add a `loa_logs_boss_name` column to the existing `raids` table and seed the value for each raid. The import engine looks up the raid by matching `current_boss` against this column. Non-last-gate entries are ignored. Example:
- "Witch of Agony, Serca" → `shadow-raid-serca`
- "Corvus Tul Rak" → `act-1-aegir`
- "Brelshaza, Ember in the Ashes" → `act-2-brelshaza`
- "Armoche, Sentinel of the Abyss" → `act-4-armoche`
- "Death Incarnate Kazeros" → `final-act-kazeros`
- "Drextalas" → `act-3-mordum`

### D5: Multi-difficulty handling
Loa Logs entries have a `difficulty` column (e.g., "Normal", "Hard"). We map this to our `raid_difficulties.difficulty` value. If the character doesn't have the raid+difficulty assigned in `character_raids`, we skip it (don't auto-assign—just mark existing assignments as completed).

### D6: Config stored in localStorage, sent via API request body
The DB path, poll toggle, and poll interval are stored in `localStorage` on the client. When calling `/api/loa-logs/scan` or `/api/loa-logs/status`, the client sends the DB path in the request body. This avoids per-user DB storage and lets each browser session manage its own config. The API is stateless regarding config — it receives the path with each call.

## Risks / Trade-offs

- **[File access]** The Loa Logs DB path is local to the server. If the app is deployed on a different machine than where Loa Logs runs, the file won't be accessible. → Mitigation: Document that this feature is for local/self-hosted setups; the config page shows a connection status.
- **[SQL injection]** The `db_path` is user-controlled. If passed unsanitized to `better-sqlite3`, a malicious path could be provided. → Mitigation: The path is used to open a database file; we validate it exists and is a `.db` file before querying.
- **[Character name collisions]** Two rosters could have characters with the same name but different users. → Mitigation: We scope the query to the authenticated user's characters only, so collisions across users are irrelevant.
- **[Raid not assigned to character]** If a character cleared a raid but doesn't have it assigned in the system, we skip it. → Mitigation: The import only marks existing assignments as completed. Users should assign raids to their characters in the roster page first.
