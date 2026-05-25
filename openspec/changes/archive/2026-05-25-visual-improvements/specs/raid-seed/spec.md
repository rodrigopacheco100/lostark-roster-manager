## ADDED Requirements

### Requirement: Seed script populates raids and difficulties
The system SHALL provide a Drizzle seed script (`src/db/seed.ts`) that inserts all known Lost Ark raids with their difficulties into the database.

#### Scenario: Run seed populates raids
- **WHEN** `pnpm db:seed` is executed
- **THEN** the raids table contains entries for all major Lost Ark raids (Valtan, Vykas, Kakul-Saydon, Brelshaza, Akkan, Ivory Tower, Thaemine, Echidna, Behemoth, Aegir, Brelshaza 2.0)

#### Scenario: Run seed populates difficulties
- **WHEN** `pnpm db:seed` is executed
- **THEN** each raid has its correct difficulties with appropriate minimum item levels (e.g., Valtan has Normal 1415 and Hard 1445)

### Requirement: Seed is idempotent
The system SHALL ensure the seed script can be safely re-run without creating duplicate entries.

#### Scenario: Re-run seed does not duplicate
- **WHEN** `pnpm db:seed` is executed twice
- **THEN** the second run does not create duplicate raid entries (uses `ON CONFLICT DO NOTHING` on raid name and difficulties)

### Requirement: Seed uses Drizzle schema imports
The system SHALL import Drizzle schema objects (`raids`, `raidDifficulties`) directly and use the `db` instance for inserts.

#### Scenario: Seed imports from schema
- **WHEN** the seed script runs
- **THEN** it inserts data using `db.insert(raids)` and `db.insert(raidDifficulties)` within a transaction
