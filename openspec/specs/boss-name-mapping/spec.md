# boss-name-mapping Specification

## Purpose
TBD - created by archiving change loa-logs-raid-import. Update Purpose after archive.
## Requirements
### Requirement: System has seeded boss name mappings per difficulty
The system SHALL be seeded with boss name mappings stored on `raid_difficulties` (`loa_logs_boss_name`, `loa_logs_difficulty`). A client-side `boss-mappings.ts` mirrors this data for browser-side lookup. Only mapped boss+difficulty combinations are imported.

#### Scenario: Armoche mapped
- **WHEN** the system encounters `current_boss = "Armoche, Sentinel of the Abyss"` with difficulty `"Normal"` or `"Hard"`
- **THEN** it SHALL map to raid slug `act-4-armoche`

#### Scenario: Kazeros last gate mapped
- **WHEN** the system encounters `current_boss = "Death Incarnate Kazeros"` with difficulty `"Normal"` or `"Hard"`
- **THEN** it SHALL map to raid slug `final-act-kazeros`

#### Scenario: Serca mapped
- **WHEN** the system encounters `current_boss = "Corvus Tul Rak"` with difficulty `"Normal"`, `"Hard"`, or `"Nightmare"`
- **THEN** it SHALL map to raid slug `shadow-raid-serca`

### Requirement: System ignores unmapped raids
Raids without `loaLogsBossName` set in the seed data SHALL NOT have mapping entries and SHALL be skipped by the import engine.

#### Scenario: Aegir skipped (not mapped)
- **WHEN** the system encounters a clear for Aegir
- **THEN** it SHALL NOT match any raid since `act-1-aegir` has no `loaLogsBossName` set

#### Scenario: Brelshaza skipped (not mapped)
- **WHEN** the system encounters a clear for Brelshaza
- **THEN** it SHALL NOT match any raid since `act-2-brelshaza` has no `loaLogsBossName` set

#### Scenario: Mordum skipped (not mapped)
- **WHEN** the system encounters a clear for Mordum
- **THEN** it SHALL NOT match any raid since `act-3-mordum` has no `loaLogsBossName` set

### Requirement: Mapping is stored on raid_difficulties
The `raid_difficulties` table SHALL have nullable `loa_logs_boss_name` and `loa_logs_difficulty` columns. Each difficulty's value SHALL be seeded to identify the Loa Logs boss name and difficulty string.

#### Scenario: Columns exist
- **WHEN** migrations have run
- **THEN** `raid_difficulties` SHALL have `loa_logs_boss_name` and `loa_logs_difficulty` columns

### Requirement: Mapping is extensible per difficulty
Adding a new raid or updating the mapping SHALL require setting `loaLogsBossName` and `loaLogsDifficulty` on the relevant `raid_difficulties` rows, plus updating `boss-mappings.ts`.

#### Scenario: New difficulty added
- **WHEN** a new difficulty is added to a raid with `loaLogsBossName` and `loaLogsDifficulty` set
- **THEN** the import engine SHALL support importing clears for that difficulty

### Requirement: Pre-Kazeros gates are explicitly excluded
Boss names that are not the last gate of Kazeros (e.g., "Abyss Lord Kazeros", "Archdemon Kazeros") SHALL NOT be in the mapping and SHALL be skipped.

#### Scenario: Non-last-gate Kazeros skipped
- **WHEN** the system encounters `current_boss = "Abyss Lord Kazeros"` or `"Archdemon Kazeros"`
- **THEN** it SHALL NOT match any raid and SHALL skip the encounter

