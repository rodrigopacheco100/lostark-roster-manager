## Why

When toggling a raid's completed state on the dashboard, the UI reverts to the previous state moments after the optimistic update — even though the batch POST to `/api/raids/batch` returns `{"updated": 2}` (200 OK). This is a race condition between the dashboard's `refetchInterval: 20000` and the 1500ms debounce in `useRaidToggleQueue`.

## What Changes

- Fix the race condition in `useRaidToggleQueue` where a `refetchInterval`-triggered dashboard refetch during the debounce window overwrites the optimistic cache update with stale (pre-toggle) server data
- After the batch POST succeeds, ensure `invalidateQueries` reliably restores the correct completed state
- Update the dashboard auto-refresh mechanism to avoid interfering with pending toggles

## Capabilities

### New Capabilities

- `raid-toggle-race-condition`: Fix the race condition between the debounced batch update and the dashboard's auto-refresh interval, ensuring toggle completion persists after save.

### Modified Capabilities

*(No existing specs are modified — this is a bug fix to existing behavior.)*

## Impact

- **File**: `src/hooks/useRaidToggleQueue.ts` — the flush/enqueue logic needs to prevent `refetchInterval` from overwriting optimistic cache during the debounce window
- **File**: `src/app/(dashboard)/dashboard/page.tsx` — the dashboard query's `refetchInterval` may need adjustment or coordination with the toggle queue
