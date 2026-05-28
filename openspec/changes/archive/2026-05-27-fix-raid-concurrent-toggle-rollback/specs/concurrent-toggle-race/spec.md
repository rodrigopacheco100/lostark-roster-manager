## ADDED Requirements

### Requirement: Toggles added during flush are not rolled back
The system SHALL ensure that when a user adds a toggle to the queue while a previous flush's POST is in-flight, the optimistic update for that toggle is not overwritten by the refetch triggered on the in-flight flush's success.

#### Scenario: Toggle during in-flight flush retains optimistic update
- **WHEN** a user toggles a raid's completed state (toggle B)
- **AND** a previous flush (for toggle A) is currently in-flight (POST not yet resolved)
- **AND** the in-flight flush resolves successfully and triggers a dashboard refetch
- **THEN** the refetch SHALL NOT overwrite toggle B's optimistic update in the cache
- **AND** the UI SHALL continue to display toggle B's optimistic state

#### Scenario: Re-applied optimistic update reflects latest queue state
- **WHEN** a user toggles a raid on and off multiple times during a flush
- **THEN** only the final state from the queue SHALL be re-applied after the refetch
