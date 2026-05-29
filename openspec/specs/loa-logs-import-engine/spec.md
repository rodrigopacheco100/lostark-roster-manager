# loa-logs-import-engine Specification

## Purpose
TBD - created by archiving change loa-logs-raid-import. Update Purpose after archive.
## Requirements
### Requirement: System reads cleared encounters from Loa Logs SQLite via sql.js
The import engine SHALL use sql.js (WASM SQLite) client-side to read the user's `encounters.db` file, processing it entirely in the browser without uploading to the server.

#### Scenario: Query cleared encounters
- **WHEN** the user selects an `encounters.db` file
- **THEN** the system SHALL open it with sql.js and execute `SELECT id, current_boss, difficulty, local_player FROM encounter_preview WHERE cleared = 1 AND fight_start >= ? AND fight_start < ? AND id > ?`

#### Scenario: Database read fails
- **WHEN** the WASM fails to load or the SQLite file is corrupt
- **THEN** the system SHALL catch the error and display it to the user

### Requirement: System filters by current weekly window
The import engine SHALL filter encounters to only those whose `fight_start` timestamp falls within the current Lost Ark weekly window (Wednesday 07:00:00 UTC to the following Wednesday 07:00:00 UTC).

#### Scenario: Filter this week's encounters
- **WHEN** computing the weekly window
- **THEN** the start SHALL be the most recent Wednesday 07:00:00 UTC and the end SHALL be the next Wednesday 07:00:00 UTC

#### Scenario: Encounters outside this week are skipped
- **WHEN** an encounter's `fight_start` is before the current Wednesday window start
- **THEN** it SHALL be excluded from processing

### Requirement: System matches local_player to character names
For each cleared encounter, the system SHALL parse the `local_player` field and match it against the authenticated user's character names (from all their rosters) using trimmed exact match.

#### Scenario: Character matched
- **WHEN** `local_player` matches a `characters.name` belonging to the authenticated user
- **THEN** the system SHALL proceed to import the raid for that character

#### Scenario: Character not found
- **WHEN** `local_player` does not match any character name for the authenticated user
- **THEN** the system SHALL skip that encounter and record the skip reason

#### Scenario: Multiple characters with same name
- **WHEN** `local_player` matches multiple characters across different rosters of the same user
- **THEN** the system SHALL apply the import to all matching characters

### Requirement: System maps current_boss+difficulty to raid slug
The system SHALL use a client-side mapping array (`boss-mappings.ts`) to translate `current_boss` and `difficulty` to an internal raid slug. Only mapped boss+difficulty combinations are imported.

#### Scenario: Boss+difficulty mapped successfully
- **WHEN** `current_boss` and `difficulty` exist in the boss mappings
- **THEN** the system SHALL retrieve the corresponding raid slug

#### Scenario: Boss not mapped
- **WHEN** `current_boss` does not exist in the boss mappings
- **THEN** the system SHALL skip that encounter with a descriptive reason

### Requirement: System marks character raid as completed via batch API
After matching a character and a raid+difficulty, the system SHALL call `/api/raids/batch` with the matched updates to set `character_raids.completed = true`.

#### Scenario: Batch update succeeds
- **WHEN** matches are sent to `/api/raids/batch`
- **THEN** the system SHALL update the last processed encounter ID and invalidate relevant query caches

#### Scenario: Batch update fails
- **WHEN** the API returns an error
- **THEN** the system SHALL display an error toast

### Requirement: System uses per-difficulty boss name mapping
The mapping from `loaLogsBossName` + `loaLogsDifficulty` to `RaidSlug` SHALL be stored on `raid_difficulties` in the database and mirrored in the client-side `boss-mappings.ts` array. Raids without `loaLogsBossName` set SHALL be skipped.

#### Scenario: Difficulty found
- **WHEN** the raid difficulty has a matching `loaLogsBossName` and `loaLogsDifficulty`
- **THEN** the system SHALL use that `raid_difficulty_id`

#### Scenario: Difficulty not found
- **WHEN** the raid does not have a matching difficulty entry
- **THEN** the system SHALL skip the encounter

