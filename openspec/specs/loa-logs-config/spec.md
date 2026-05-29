# loa-logs-config Specification

## Purpose
TBD - created by archiving change loa-logs-raid-import. Update Purpose after archive.
## Requirements
### Requirement: User can connect to Loa Logs database via file picker
The system SHALL provide a configuration page at `/loa-logs` where the user can select their `encounters.db` file using the browser's File System Access API (`showOpenFilePicker`). The file handle SHALL be persisted in IndexedDB for cross-session access.

#### Scenario: Connect to database
- **WHEN** the user clicks "Connect to Loa Logs"
- **THEN** the browser file picker SHALL open, allowing selection of an `.db` file
- **THEN** the handle SHALL be stored in IndexedDB

#### Scenario: Permission re-grant on page reload
- **WHEN** the page reloads and the stored handle exists
- **THEN** the system SHALL check `handle.queryPermission()` and attempt to start polling if `"granted"`
- **WHEN** permission is `"prompt"`, the user SHALL need to click "Connect" to re-authorize

### Requirement: Auto-polling runs globally every 30 seconds
When connected, the system SHALL poll the encounters.db file every 30 seconds in the background, processing new cleared encounters automatically. The polling SHALL run across all authenticated pages (not just `/loa-logs`).

#### Scenario: Auto-poll starts on connect
- **WHEN** the user connects a file
- **THEN** polling SHALL start immediately with a 30s interval

#### Scenario: New clears detected
- **WHEN** the poll finds encounters with `id > lastProcessedId`
- **THEN** the system SHALL process them, call `/api/raids/batch`, and show a success toast

#### Scenario: No new clears
- **WHEN** the poll finds no new encounters
- **THEN** the system SHALL do nothing

#### Scenario: File becomes inaccessible
- **WHEN** the poll fails because the file handle is invalid
- **THEN** the system SHALL disconnect and remove the stored handle

### Requirement: User can disconnect
The configuration page SHALL have a "Disconnect" button that stops polling and removes the stored file handle and last processed encounter ID.

#### Scenario: Disconnect
- **WHEN** the user clicks "Disconnect"
- **THEN** polling SHALL stop, the handle SHALL be removed from IndexedDB, and state resets

### Requirement: System imports via batch API
When new clears are found, the system SHALL send matched results to `/api/raids/batch`. Maximum 50 updates per call (enforced by the API).

#### Scenario: Batch import
- **WHEN** matches are found
- **THEN** the system SHALL POST to `/api/raids/batch` with `{ updates: [{ characterId, raidDifficultyId, completed: true }] }`

#### Scenario: Cache invalidation
- **WHEN** the batch import succeeds
- **THEN** the system SHALL invalidate `/api/raids` and `dashboard` query caches

### Requirement: System shows connection status
The configuration page SHALL display whether the system is connected or disconnected via a colored badge.

#### Scenario: Connected
- **WHEN** a file is connected
- **THEN** the system SHALL show a green "Connected" badge

#### Scenario: Disconnected
- **WHEN** no file is connected
- **THEN** the system SHALL show a gray "Disconnected" badge

