## ADDED Requirements

### Requirement: Weekly completion tracked per character per raid
The system SHALL track whether a character has completed each assigned raid difficulty in the current weekly cycle.

#### Scenario: View completion status
- **WHEN** a user views a character's assigned raids
- **THEN** each assigned raid shows a completion indicator (checked/unchecked) for the current week

#### Scenario: Toggle completion
- **WHEN** a user clicks the completion checkbox for a character's raid
- **THEN** the completion status toggles and persists

### Requirement: External reset endpoint
The system SHALL provide `POST /api/reset` that sets all `completed` flags to `false`, protected by an API key.

#### Scenario: Successful reset with valid key
- **WHEN** a request is made to `POST /api/reset` with a valid `X-API-KEY` header
- **THEN** all `completed` flags on `character_raids` are set to `false` and a 200 response is returned

#### Scenario: Reset with invalid key
- **WHEN** a request is made to `POST /api/reset` with an invalid or missing `X-API-KEY`
- **THEN** a 401 response is returned

### Requirement: Completion data model
The system SHALL store completion status as a `completed` boolean column on the `character_raids` table.

#### Scenario: Flag set to true on complete
- **WHEN** a user marks a raid as complete
- **THEN** the `completed` column on that `character_raids` row is set to `true`

#### Scenario: Flag set to false on uncomplete
- **WHEN** a user unmarks a completed raid
- **THEN** the `completed` column on that `character_raids` row is set to `false`
