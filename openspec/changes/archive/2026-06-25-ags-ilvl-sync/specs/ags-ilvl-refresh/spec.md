## ADDED Requirements

### Requirement: Sync ilvl button
The system SHALL provide a button on the `/rosters` list page that, when clicked, fetches current character data from the AGS API for all linked rosters and updates their `itemLevel` values in the local database.

#### Scenario: Sync button visible
- **WHEN** the user is on the `/rosters` page and at least one roster has `rosterGuid` set
- **THEN** a "Sync ilvl" button SHALL be displayed

#### Scenario: Sync button hidden when no linked rosters
- **WHEN** no roster has `rosterGuid` set
- **THEN** the sync button SHALL NOT be displayed

#### Scenario: Sync updates character item levels
- **WHEN** the user clicks "Sync ilvl" and the API call succeeds
- **THEN** all characters in linked rosters SHALL have their `itemLevel` updated to match AGS API data
- **AND** the response SHALL return the count of updated characters

#### Scenario: Sync button hidden when AGS_API_KEY is not configured
- **WHEN** the server has `AGS_API_KEY` set to an empty string
- **THEN** the sync button SHALL be hidden

### Requirement: 1-hour cooldown
The system SHALL prevent the user from triggering a sync more than once per hour, using localStorage to track the last successful sync timestamp.

#### Scenario: Cooldown prevents immediate re-sync
- **WHEN** the user clicks "Sync ilvl" and the sync completes successfully
- **THEN** a timestamp SHALL be saved in localStorage under key `ags:ilvl-sync:last-sync-ts`
- **AND** the button SHALL be disabled for 1 hour from that timestamp

#### Scenario: Cooldown timer display
- **WHEN** the button is in cooldown state
- **THEN** the button SHALL show the remaining time (e.g., "Sync ilvl (45m remaining)") or be visually disabled with a countdown

#### Scenario: Cooldown persists across page reloads
- **WHEN** the user reloads the page during cooldown
- **THEN** the button SHALL remain disabled based on the stored localStorage timestamp

#### Scenario: Cooldown expires after 1 hour
- **WHEN** more than 1 hour has passed since the last successful sync
- **THEN** the button SHALL become enabled again

#### Scenario: Sync failure does not trigger cooldown
- **WHEN** the sync API call fails or returns an error
- **THEN** the cooldown timestamp SHALL NOT be saved
- **AND** the user SHALL be able to retry immediately

### Requirement: Loading state during sync
The system SHALL show a loading indicator while the sync is in progress.

#### Scenario: Loading state during sync
- **WHEN** the user clicks "Sync ilvl" and the request is in flight
- **THEN** the button SHALL show a loading/spinner state
- **AND** the button SHALL be disabled to prevent duplicate clicks

### Requirement: Toast notification on sync result
The system SHALL display a toast notification after the sync completes.

#### Scenario: Success toast
- **WHEN** the sync completes successfully
- **THEN** a success toast SHALL be shown with the number of characters updated

#### Scenario: Error toast
- **WHEN** the sync fails
- **THEN** an error toast SHALL be shown with the error message
