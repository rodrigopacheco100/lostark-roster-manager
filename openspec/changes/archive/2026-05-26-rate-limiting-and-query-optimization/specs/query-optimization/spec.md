## ADDED Requirements

### Requirement: Global React Query defaults are configured
The React Query client SHALL have sensible global defaults for staleTime, gcTime, and retry behavior.

#### Scenario: Default staleTime is 30 seconds
- **WHEN** a query resolves successfully
- **THEN** the data is considered fresh for 30 seconds before a refetch is triggered

#### Scenario: Default gcTime is 5 minutes
- **WHEN** a query is unused (no subscribers)
- **THEN** the cached data persists for 5 minutes before garbage collection

#### Scenario: Retries use exponential backoff
- **WHEN** a query or mutation fails
- **THEN** React Query retries up to 2 times with exponential backoff delay

### Requirement: Per-page queries are optimized
Each page SHALL override global defaults with query-specific settings appropriate to its data volatility.

#### Scenario: Dashboard keeps 60s auto-refresh with staleTime
- **WHEN** the Dashboard page mounts
- **THEN** it refetches every 60s with a 30s staleTime

#### Scenario: Static pages have longer staleTime
- **WHEN** a friends, groups, or rosters list page mounts
- **THEN** the query uses a staleTime of 60 seconds with no auto-refetch interval
