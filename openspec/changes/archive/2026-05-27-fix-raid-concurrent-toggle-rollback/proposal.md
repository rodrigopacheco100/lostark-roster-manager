## Why

When the user toggles raid completion on the dashboard and then toggles another raid while the first toggle's POST is still in-flight, the second toggle's optimistic cache update gets overwritten by the `invalidateQueries` refetch from the first flush — causing a visible rollback of the second toggle until its flush eventually completes.

## What Changes

- Fix the race in `useRaidToggleQueue` where `invalidateQueries` in `flush()` triggers a dashboard refetch that overwrites pending optimistic updates from queue items added during the flush
- After the refetch completes, re-apply any pending toggle entries' optimistic updates to the cache

## Capabilities

### New Capabilities

- `concurrent-toggle-race`: Ensure that toggles added to the queue while a flush is in-flight are not rolled back when the in-flight flush's `invalidateQueries` refetch completes

### Modified Capabilities

- `raid-toggle-race-condition` (from previous fix): Extend the spec — the `isTogglingRef` guard already prevents `refetchInterval` interference, but concurrent user toggles during a flush can still cause a rollback

## Impact

- **File**: `src/hooks/useRaidToggleQueue.ts` — the `flush` function's success path needs to await the invalidation refetch and re-apply pending optimistic updates
