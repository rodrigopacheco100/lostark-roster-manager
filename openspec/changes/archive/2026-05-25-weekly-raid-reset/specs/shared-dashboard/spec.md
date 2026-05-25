## ADDED Requirements

### Requirement: Unified dashboard shows own and friends' rosters
The system SHALL display the user's rosters and their friends' rosters in a single dashboard view.

#### Scenario: Dashboard loads with all rosters
- **WHEN** a user visits the dashboard
- **THEN** they see their own rosters followed by each friend's rosters with the friend's name as a section header

#### Scenario: Friends without rosters hidden
- **WHEN** a friend has no rosters
- **THEN** that friend does not appear as a section on the dashboard

### Requirement: Compact per-character raid view
The system SHALL display each character's assigned raids in a compact row format with completion checkboxes.

#### Scenario: Character row shows raid status
- **WHEN** viewing a character's assigned raids
- **THEN** each raid appears as a compact badge/pill with a checkbox indicating completion status

### Requirement: Collapsible roster and owner sections
The system SHALL allow collapsing/expanding roster and owner sections to manage visual density.

#### Scenario: Sections collapsed by default
- **WHEN** the dashboard loads
- **THEN** all owner and roster sections are collapsed, showing only the header and summary badges

#### Scenario: Expand a section
- **WHEN** a user clicks the collapse toggle on a section header
- **THEN** the contents of that section are shown or hidden

### Requirement: Per-raid progress badges at roster level
The system SHALL aggregate completion progress per raid across all characters in a roster.

#### Scenario: Roster header shows per-raid badges
- **WHEN** viewing a roster section header
- **THEN** each distinct raid appears as a badge showing "completed/total RaidName (difficulty)", turning green when all are done

### Requirement: Per-raid progress badges at owner level
The system SHALL aggregate completion progress per raid across all rosters of an owner (user or friend).

#### Scenario: Owner header shows per-raid badges
- **WHEN** viewing an owner section header
- **THEN** each distinct raid appears as a badge showing "completed/total RaidName (difficulty)" aggregated across all their rosters

### Requirement: Raids sorted by item level
The system SHALL display raids ordered by minimum item level from lowest to highest.

#### Scenario: Raids ordered by minIlvl
- **WHEN** a character's raids are displayed
- **THEN** they appear sorted by minIlvl ascending

### Requirement: Overall progress summary for own rosters only
The system SHALL display a summary bar showing the logged user's own raid completion progress.

#### Scenario: Summary bar visible
- **WHEN** the dashboard loads
- **THEN** a summary bar at the top shows "X/Y raids completed" for the logged user's own rosters only

#### Scenario: Summary updates on toggle
- **WHEN** a user toggles a raid completion
- **THEN** the summary count updates to reflect the change

### Requirement: React Query for data fetching
The system SHALL use `@tanstack/react-query` for all data fetching and mutations on the dashboard.

#### Scenario: Dashboard query
- **WHEN** the dashboard page mounts
- **THEN** it fetches data via `useQuery` with `queryKey: ["dashboard"]` and auto-refreshes every 60 seconds

#### Scenario: Completion toggle mutation
- **WHEN** a user clicks a raid checkbox
- **THEN** a `useMutation` PATCH is sent, and on success the dashboard query is invalidated to refresh all data
