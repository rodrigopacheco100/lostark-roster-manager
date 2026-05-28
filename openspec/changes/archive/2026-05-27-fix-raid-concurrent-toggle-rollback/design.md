## Context

The `useRaidToggleQueue` hook uses a debounced batch queue: `enqueue` adds an entry, waits 1.5s, then `flush` sends all queued entries via POST `/api/raids/batch`. On success, `flush` calls `invalidateQueries(["dashboard"])` to refresh the dashboard from the server.

**Race**: If `enqueue` is called while a `flush` is in-flight (between `await httpClient.post` resolving and `invalidateQueries` completing):

1. `flush` clears the queue at the start, so `enqueue` sees an empty queue and takes a new snapshot + applies its optimistic update to the cache
2. When the in-flight `flush` resolves, `invalidateQueries` triggers a dashboard refetch
3. The refetch returns server data **without** the new toggle's state (because its POST hasn't been sent yet)
4. The cache is overwritten — the new toggle's optimistic update is lost

The user sees the second toggle revert briefly, then come back when its own flush completes ~0.6s later.

## Goals / Non-Goals

**Goals:**
- Eliminate the rollback when toggling raids while a flush is in-flight
- Preserve the existing optimistic update + debounce pattern
- Minimal change to the `flush` function

**Non-Goals:**
- Changing the batch API contract
- Restructuring the debounce mechanism
- Changing the snapshot/error-rollback logic

## Decisions

### Approach: Await invalidation refetch, then re-apply pending optimistic updates

**Chosen approach**: In the `flush` success path, change `queryClient.invalidateQueries(...)` (fire-and-forget) to `await queryClient.invalidateQueries(...)` (waits for refetch), then iterate over `queueRef.current` and re-apply any pending optimistic updates via `setQueryData`.

**Why this approach:**
1. `invalidateQueries` in React Query v5 returns `Promise<void>` — awaiting it guarantees the server refetch completes before we continue
2. After the refetch, the cache has the server's truth (post-this-flush). Any entries added to the queue during the flush are still in `queueRef.current` — we re-apply their optimistic updates on top of the fresh server data
3. The next `flush` (triggered by the timer set in `enqueue`) will send those entries to the server as normal

**Alternatives considered:**

| Alternative | Reason rejected |
|---|---|
| Skip `invalidateQueries` if queue was repopulated during flush | The refetch is still needed for other users' changes (friends' rosters); also misses the server's confirmation of the current flush's updates |
| Use `refetchType: 'none'` and schedule manual refetch later | Overcomplicates the logic — the refetch is correct, we just need to re-overlay pending optimistic updates after it |
| Store pending optimistic updates separately and replay them | Equivalent to re-reading `queueRef.current` after the refetch, but with more state to manage |

### Detailed flow

```
flush() called (queue has [A])
  ├─ updates = [A], queue.clear()
  ├─ POST /api/raids/batch  (in-flight)
  │     └─ enqueue(B) called during POST
  │          ├─ queue.size === 0 → snapshot, setQueryData(B)
  │          └─ queue = {B}, timer = 1.5s
  ├─ POST resolves → { updated: 1 }
  ├─ await invalidateQueries(["dashboard"])
  │     └─ refetch → cache = A✅, B❌  (server truth)
  ├─ re-apply pending from queueRef.current
  │     └─ setQueryData → flipInCache(B, true)
  │     └─ cache = A✅, B✅  (optimistic overlay)
  └─ isTogglingRef = false
```

After this fix, the user sees both toggles correctly without any revert.

## Risks / Trade-offs

- **The await adds latency to the flush completion** — the `isTogglingRef` flag stays `true` until the refetch finishes (typically <200ms). This is acceptable because it prevents `refetchInterval` from interfering during this critical window.
- **Re-applying uses `setQueryData` which triggers a re-render** — this is the same mechanism already used by `enqueue`, so no new performance concern.
