## Context

The `useRaidToggleQueue` flush function previously called `invalidateQueries(["dashboard"])` after a successful POST to refresh the dashboard from the server. This triggered a refetch that unconditionally overwrote the React Query cache with server data.

**Problem**: Any toggle enqueued during the POST (while it was in-flight) had its optimistic update already applied to the cache via `setQueryData`. When `invalidateQueries` triggered a refetch, the server data (which didn't include the new toggle) overwrote the cache, destroying the optimistic update. The subsequent re-apply loop was added to fix this, but it introduced a new race: a second flush could clear `queueRef.current` before the re-apply read it.

The fix is to remove `invalidateQueries` entirely. The cache is already correct because `enqueue` applies optimistic updates at click time. No server refetch is needed — the POST returned 200, so the server matches the cache.

## Goals / Non-Goals

**Goals:**
- Eliminate ALL races between flush and enqueue
- Simplify the flush success path
- Cache remains correct via existing `setQueryData` in `enqueue`

**Non-Goals:**
- Changing the batch API
- Changing the debounce mechanism
- Changing the snapshot/error-rollback logic

## Decisions

### Approach: Remove `invalidateQueries` from flush

**Chosen approach**: Delete the `invalidateQueries` call and the re-apply loop from the flush success path. The flush just sends the POST, and on success, clears `isTogglingRef`.

**Why this works:**
1. `enqueue` already calls `setQueryData` to apply optimistic updates immediately on user click — the cache is always up to date
2. The POST returns 200, confirming the server accepted the change — no need to re-read what we just wrote
3. Friends' roster updates are still picked up by `refetchInterval: 20000` (guarded by `isTogglingRef`)
4. No `invalidateQueries` = no refetch = no data loss = zero races

**Alternatives considered:**

| Alternative | Reason rejected |
|---|---|
| `await invalidateQueries` + re-apply (previous fix) | Still has race if second flush clears queue before re-apply reads it |
| Mutex/lock to prevent concurrent flushes | More complex, edge cases with `cancelQueries` aborting in-flight invalidate |
| Use `refetchType: 'none'` and refetch in next flush | Overcomplicates for same result — simply not refetching is cleaner |

### Data flow (after fix)

```
User clicks → enqueue(A)
  ├─ setQueryData → cache = A✅  (optimistic)
  ├─ timer 1.5s → flush()
       ├─ POST /api/raids/batch → 200
       └─ isTogglingRef = false

User clicks B during flush POST
  ├─ setQueryData → cache = A✅ B✅  (already correct!)
  └─ timer 1.5s → next flush → POST B

No refetch → no overwrite → no race.
```

## Risks / Trade-offs

- **Dashboard shows stale friend data for up to 20s** — The `refetchInterval: 20000` still works (guarded by `isTogglingRef`), so friends' roster updates are picked up within 20s. This was already the case before any of these fixes existed.
- **No confirmation that cache matches server after flush** — The POST returned 200, so the server confirmed the change. The cache was set optimistically at click time. They match.
