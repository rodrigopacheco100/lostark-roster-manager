## ADDED Requirements

### Requirement: User can connect via drag-and-drop
The configuration page SHALL accept an `encounters.db` file dropped onto the drop zone. On drop, it SHALL call `DataTransferItem.getAsFileSystemHandle()` to obtain a `FileSystemFileHandle`, then follow the same connection flow as the file picker.

#### Scenario: Drop to connect
- **WHEN** the user drags and drops a `.db` file onto the drop zone
- **THEN** the system SHALL obtain the file handle via `getAsFileSystemHandle()`
- **THEN** the system SHALL request read permission and persist the handle

#### Scenario: Browser does not support drag-drop
- **WHEN** the user drops a file and `getAsFileSystemHandle` is not available
- **THEN** the system SHALL show a toast: "Drag-and-drop not supported in this browser. Click to select instead."

### Requirement: System shows import history
The configuration page SHALL display a table of recent imports showing boss, character, difficulty, and relative time. The table SHALL be scrollable with infinite scroll (loads more as the user scrolls down). History SHALL persist in localStorage.

#### Scenario: Import history shown when connected
- **WHEN** the system is connected and has at least one successful import
- **THEN** the system SHALL display a "Import History" card below the connection card
- **THEN** the table SHALL show the most recent imports first

#### Scenario: Infinite scroll loads more rows
- **WHEN** the user scrolls to within 150px of the bottom of the import history container
- **THEN** the system SHALL load 20 additional rows (up to the total available)

### Requirement: No success toast on auto-import
The system SHALL NOT display a success toast when new clears are automatically imported. Instead, the import history table updates in real-time.

#### Scenario: Auto-import without toast
- **WHEN** a poll cycle successfully imports new encounters
- **THEN** the system SHALL update the import history
- **THEN** the system SHALL NOT show a success toast

## MODIFIED Requirements

### Requirement: Auto-polling runs globally every 30 seconds
The system SHALL poll the encounters.db file every 60 seconds in the background, processing new cleared encounters automatically. The polling SHALL run across all authenticated pages (not just `/loa-logs`).

#### Scenario: Auto-poll starts on connect
- **WHEN** the user connects a file
- **THEN** polling SHALL start immediately with a 60s interval

#### Scenario: New clears detected
- **WHEN** the poll finds encounters not yet imported
- **THEN** the system SHALL filter out already-imported timestamps, process new ones, and call `/api/raids/batch`

#### Scenario: No new clears
- **WHEN** the poll finds no new encounters or all are already imported
- **THEN** the system SHALL update the checkpoint and do nothing else

#### Scenario: File becomes inaccessible
- **WHEN** the poll fails because the file handle is invalid
- **THEN** the system SHALL disconnect, remove the stored handle, and clear all storage

### Requirement: User can connect to Loa Logs database via file picker
The system SHALL provide a unified drop zone at `/loa-logs` that accepts both clicks (opens `showOpenFilePicker`) and drag-and-drop. The file handle SHALL be persisted in IndexedDB for cross-session access.

#### Scenario: Connect to database
- **WHEN** the user clicks the drop zone
- **THEN** the browser file picker SHALL open, allowing selection of an `.db` file
- **THEN** the handle SHALL be stored in IndexedDB

#### Scenario: Permission re-grant on page reload
- **WHEN** the page reloads and the stored handle exists
- **THEN** the system SHALL check `handle.queryPermission()` and start polling if `"granted"`
- **WHEN** permission is `"prompt"`, the user SHALL need to click the drop zone to re-authorize

### Requirement: System imports via batch API
When new clears are found, the system SHALL filter matches against already-imported timestamps from localStorage, then send only new matches to `/api/raids/batch`. Maximum 50 updates per call (enforced by the API).

#### Scenario: Dedup matches before batch
- **WHEN** matches are found
- **THEN** the system SHALL filter out matches whose `fightStart|characterName|bossName` already exists in `loaLogsImportHistory`
- **THEN** the system SHALL POST to `/api/raids/batch` with only the new matches

#### Scenario: All matches are already imported
- **WHEN** all matched encounters have been imported previously
- **THEN** the system SHALL skip the API call and update the checkpoint

#### Scenario: Cache invalidation
- **WHEN** the batch import succeeds
- **THEN** the system SHALL invalidate `/api/raids` and `dashboard` query caches

### Requirement: User can disconnect
The configuration page SHALL have a "Disconnect" button that stops polling and removes all stored data (handle from IndexedDB, file info, checkpoint, and import history from localStorage).

#### Scenario: Disconnect
- **WHEN** the user clicks "Disconnect"
- **THEN** polling SHALL stop, the handle SHALL be removed from IndexedDB, import history and checkpoint SHALL be cleared from localStorage, and state resets

