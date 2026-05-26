## ADDED Requirements

### Requirement: Pages SHALL use useQuery for data fetching
All pages SHALL fetch data using @tanstack/react-query's `useQuery` hook instead of SWR's `useSWR`.

#### Scenario: Page fetches data with useQuery
- **WHEN** a page component renders
- **THEN** it SHALL use `useQuery` with a `queryKey` array and a fetcher function

### Requirement: Detail pages SHALL retry on error only if explicitly configured
Detail pages (groups/[id], rosters/[id]) SHALL set `retry: false` to avoid retrying on client errors (403, 404).

#### Scenario: Detail page receives 403 or 404
- **WHEN** a detail page query returns a 403 or 404 error
- **THEN** the component SHALL show an error toast and redirect to the list page

### Requirement: Query invalidation SHALL use useQueryClient
After mutations, related queries SHALL be invalidated using `useQueryClient().invalidateQueries({ queryKey })`.

#### Scenario: Mutation completes successfully
- **WHEN** a mutation succeeds
- **THEN** the `onSuccess` callback SHALL call `invalidateQueries` with the relevant query key
