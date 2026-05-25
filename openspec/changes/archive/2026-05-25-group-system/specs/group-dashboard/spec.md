## ADDED Requirements

### Requirement: Dashboard shows group members' rosters
The system SHALL include rosters from all group members (excluding the current user) in the dashboard response, alongside friends' rosters.

#### Scenario: Dashboard includes group rosters
- **WHEN** a user who belongs to groups loads the dashboard
- **THEN** the response includes `rosters` entries for each unique group member (non-self), each with their rosters

### Requirement: Dashboard annotates owners with group names
The system SHALL include group names in parentheses next to owner names on the dashboard, showing which groups the user shares with that owner.

#### Scenario: Owner has matching group annotation
- **WHEN** a dashboard roster entry belongs to a user who shares a group with the current user
- **THEN** the `owner.groups` field contains an array of group names, e.g., `["Static Group", "Guild"]`

#### Scenario: Owner not in groups shows empty annotation
- **WHEN** a dashboard roster entry belongs to a friend who is not in any shared groups
- **THEN** the `owner.groups` field is an empty array `[]`

### Requirement: Duplicate owner entries are merged
If a user appears both as a friend and as a group member, the system SHALL return a single owner entry with both annotations present (group names shown, friend relationship implied).

#### Scenario: Friend is also group member
- **WHEN** a user is both a friend and a group member of the current user
- **THEN** the dashboard returns one entry with `owner.groups` populated

### Requirement: Dashboard API extends existing response structure
The response structure from `GET /api/dashboard` SHALL include the existing `rosters` array and `summary` object, without breaking changes.

#### Scenario: Existing dashboard consumers still work
- **WHEN** the dashboard frontend fetches `/api/dashboard` after this change
- **THEN** the response shape is identical to before, with the addition of `owner.groups` field
