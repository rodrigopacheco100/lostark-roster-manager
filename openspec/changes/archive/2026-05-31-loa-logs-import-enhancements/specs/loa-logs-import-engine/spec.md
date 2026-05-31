## MODIFIED Requirements

### Requirement: System reads cleared encounters from Loa Logs SQLite via sql.js
The import engine SHALL use sql.js (WASM SQLite) client-side to read the user's `encounters.db` file, processing it entirely in the browser without uploading to the server. The query SHALL also select the `fight_start` column for dedup and display purposes.

#### Scenario: Query cleared encounters
- **WHEN** the user selects an `encounters.db` file
- **THEN** the system SHALL open it with sql.js and execute `SELECT id, current_boss, difficulty, local_player, fight_start FROM encounter_preview WHERE cleared = 1 AND fight_start >= ? AND fight_start < ? AND id > ?`

#### Scenario: Database read fails
- **WHEN** the WASM fails to load or the SQLite file is corrupt
- **THEN** the system SHALL catch the error and display it to the user

### Requirement: System matches local_player to character names
For each cleared encounter, the system SHALL parse the `local_player` field and match it against the authenticated user's character names (from all their rosters) using trimmed exact match. The MatchResult SHALL include `difficulty` and `fightStart` fields.

#### Scenario: Character matched
- **WHEN** `local_player` matches a `characters.name` belonging to the authenticated user
- **THEN** the system SHALL produce a MatchResult with `{ characterId, raidDifficultyId, completed, bossName, characterName, difficulty, fightStart }`

#### Scenario: Character not found
- **WHEN** `local_player` does not match any character name for the authenticated user
- **THEN** the system SHALL skip that encounter and record the skip reason

#### Scenario: Multiple characters with same name
- **WHEN** `local_player` matches multiple characters across different rosters of the same user
- **THEN** the system SHALL apply the import to all matching characters

### Requirement: System marks character raid as completed via batch API
After matching a character and a raid+difficulty, the system SHALL filter matches against import history timestamps from localStorage to prevent duplicates, then call `/api/raids/batch` with the new matches.

#### Scenario: Batch update succeeds
- **WHEN** new (non-duplicate) matches are sent to `/api/raids/batch`
- **THEN** the system SHALL add each match's `{ fightStart, characterName, bossName }` to the import history in localStorage
- **THEN** the system SHALL update the last processed encounter checkpoint and invalidate relevant query caches

#### Scenario: Batch update fails
- **WHEN** the API returns an error
- **THEN** the system SHALL display an error toast
