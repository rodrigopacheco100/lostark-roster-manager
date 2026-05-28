## Why

The previous fix for concurrent toggle rollback used `await invalidateQueries` + re-apply loop to prevent optimistic updates from being overwritten. This still had a race: if a second flush cleared the queue between the invalidate resolving and the re-apply reading `queueRef.current`, the re-apply would see an empty queue and the toggle would still roll back.

The root cause is `invalidateQueries` itself — it triggers a dashboard refetch that unconditionally overwrites the cache with server data, destroying any pending optimistic updates. Removing it entirely eliminates the race completely.

## What Changes

- Remove `invalidateQueries` from the `flush` success path in `useRaidToggleQueue`
- Remove the re-apply loop (no longer needed)
- The cache stays correct because `enqueue` already applies optimistic updates via `setQueryData`

## Capabilities

### New Capabilities

- `no-invalidate-on-flush`: Remove `invalidateQueries` from the flush success path to eliminate the race condition where a server refetch overwrites pending optimistic updates

### Modified Capabilities

*(No existing specs are modified — this is a simplification of the previous fix.)*

## Impact

- **File**: `src/hooks/useRaidToggleQueue.ts` — the flush success path is simplified to just set `isTogglingRef.current = false` after a successful POST
