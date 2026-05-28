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

## MODIFIED Requirements

### Requirement: Dashboard API response SHALL include owner image

The `GET /api/dashboard` response SHALL include an optional `image` field in each `owner` object.

#### Scenario: Dashboard API returns owners with images
- **WHEN** the dashboard API fetches owners (self, friends, group members)
- **THEN** each `owner` object SHALL include an `image` field with the user's avatar URL (or null)

### Requirement: OwnerInfo type SHALL include image field

The `OwnerInfo` TypeScript type SHALL include an optional `image: string | null` field.

#### Scenario: OwnerInfo is constructed
- **WHEN** OwnerInfo is created in the dashboard API
- **THEN** the `image` field SHALL be populated from `user.image`
