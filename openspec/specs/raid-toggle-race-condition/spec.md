## ADDED Requirements

### Requirement: Toggle completion persists after API response
The system SHALL ensure that when a user toggles a raid's completed state on the dashboard, the UI displays the toggled state after the batch update API responds successfully, without reverting to the previous state due to auto-refresh interference.

#### Scenario: Toggle persists despite auto-refresh timing
- **WHEN** a user toggles a raid's completed state
- **AND** the dashboard's auto-refetch interval fires during the debounce window
- **THEN** the auto-refetch SHALL NOT overwrite the optimistic cache update with stale data
- **AND** after the batch API responds successfully, the UI SHALL display the toggled completed state

#### Scenario: Auto-refresh resumes after flush completes
- **WHEN** a user toggles a raid's completed state
- **AND** the batch API responds (success or error)
- **THEN** the dashboard's auto-refresh mechanism SHALL resume normal operation for subsequent interval ticks
