## ADDED Requirements

### Requirement: Instant visual feedback on toggle
The system SHALL update the raid's completed state in the UI immediately when the user clicks the toggle, without waiting for the server response.

#### Scenario: Toggle completes a raid
- **WHEN** the user clicks an unchecked raid toggle
- **THEN** the checkbox immediately shows as checked (green background, check icon)
- **THEN** a PATCH request is sent to the server in the background

#### Scenario: Toggle uncompletes a raid
- **WHEN** the user clicks a checked raid toggle
- **THEN** the checkbox immediately shows as unchecked (gray background, X icon)
- **THEN** a PATCH request is sent to the server in the background

### Requirement: Rollback on server error
The system SHALL revert the toggle to its previous state if the server request fails.

#### Scenario: Server returns error
- **WHEN** the user clicks a toggle and the PATCH request returns an error
- **THEN** the checkbox reverts to its state before the click
- **THEN** an error toast is shown indicating the toggle failed

#### Scenario: Server returns 403 (not owner)
- **WHEN** a non-owner user clicks a toggle and the server returns 403
- **THEN** the checkbox reverts to its original state
- **THEN** an error toast is shown

### Requirement: Error-only toast feedback
The system SHALL show a toast notification only when the toggle fails, not on success or during loading.

#### Scenario: Toggle succeeds — no toast
- **WHEN** the user clicks a toggle and the PATCH request succeeds
- **THEN** no toast notification is shown
- **THEN** the checkbox remains in its toggled state

#### Scenario: Toggle fails — error toast shown
- **WHEN** the user clicks a toggle and the PATCH request fails
- **THEN** an error toast with "Failed to update raid status" is shown

### Requirement: Cache consistency after toggle
The system SHALL invalidate the dashboard query cache after the mutation settles to ensure consistency with the server.

#### Scenario: Cache invalidation on settle
- **WHEN** a toggle mutation settles (either success or failure)
- **THEN** the `["dashboard"]` query is invalidated
- **THEN** the next read of dashboard data re-fetches from the server
