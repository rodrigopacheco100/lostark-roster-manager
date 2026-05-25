## ADDED Requirements

### Requirement: Dashboard shows own rosters' raid progress
The system SHALL display a summary of raid completion progress across all of the authenticated user's rosters and characters.

#### Scenario: View own dashboard
- **WHEN** authenticated user navigates to the dashboard
- **THEN** a summary is shown with total raids, completed raids, and completion percentage across all their rosters

#### Scenario: Roster-level breakdown
- **WHEN** user views the dashboard
- **THEN** each roster is shown with its own completion summary and character list

### Requirement: Dashboard includes friends' raid progress
The system SHALL display raid completion progress for the authenticated user's friends.

#### Scenario: View friends' progress
- **WHEN** user views the dashboard
- **THEN** each friend is listed with their roster names and overall raid completion percentage

#### Scenario: Click through to friend details
- **WHEN** user clicks on a friend's roster on the dashboard
- **THEN** the system shows that roster's characters and raid completion status in read-only mode

### Requirement: Dashboard filters by weekly cycle
The system SHALL display raid progress data for the current weekly cycle only.

#### Scenario: Current week filter
- **WHEN** user views the dashboard
- **THEN** only the current week's raid completion data is shown

### Requirement: Dashboard auto-refreshes
The system SHALL periodically refresh dashboard data to reflect recent changes.

#### Scenario: Dashboard auto-refresh
- **WHEN** user stays on the dashboard page
- **THEN** data refreshes every 60 seconds via SWR polling
