## ADDED Requirements

### Requirement: Flush does not trigger dashboard refetch
The system SHALL NOT call `invalidateQueries` or any other cache-refetch mechanism on the dashboard query after a successful batch POST. The cache SHALL be updated exclusively via `setQueryData` at enqueue time.

#### Scenario: Flush success does not refetch dashboard
- **WHEN** a flush completes successfully (POST returns 200)
- **THEN** the system SHALL NOT trigger any refetch of the dashboard query
- **AND** the dashboard cache SHALL retain its current state (including any pending optimistic updates)

#### Scenario: Friends' roster updates still arrive via refetchInterval
- **WHEN** no toggles are pending (`isTogglingRef` is false)
- **AND** the `refetchInterval` timer fires
- **THEN** the dashboard SHALL refetch normally, picking up friends' roster updates
