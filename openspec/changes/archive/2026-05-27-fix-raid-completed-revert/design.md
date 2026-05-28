## Context

The dashboard page (`src/app/(dashboard)/dashboard/page.tsx`) uses `useQuery` with `refetchInterval: 20000` to auto-refresh every 20s. The `useRaidToggleQueue` hook provides optimistic toggle UX with a 1500ms debounce before sending a batch POST to `/api/raids/batch`.

**Root cause**: A race condition between the `refetchInterval` timer and the debounced flush. If the `refetchInterval` fires during the debounce window:

1. `enqueue()` cancels any in-flight dashboard query and applies an optimistic cache update
2. Before `flush()` fires (1.5s debounce), the `refetchInterval` starts a new dashboard fetch
3. This fetch returns **old** (pre-toggle) server data and overwrites the optimistic cache
4. `flush()` succeeds → `invalidateQueries(["dashboard"])` starts a **new** fetch with correct data
5. If the `refetchInterval` fetch completes **after** the `invalidateQueries` fetch (race wins), the stale data persists in the cache — and the UI shows the reverted state

**Relevant code**:
- `src/hooks/useRaidToggleQueue.ts` — lines 69-87: `enqueue()` with debounce + optimistic update
- `src/hooks/useRaidToggleQueue.ts` — lines 48-67: `flush()` with `invalidateQueries` on success
- `src/app/(dashboard)/dashboard/page.tsx` — line 16: `refetchInterval: 20000`

## Goals / Non-Goals

**Goals:**
- Toggling a raid's completed state persists in the UI after the API response (no revert)
- Preserve auto-refresh behavior for friends' roster updates when no toggle is pending
- Minimal code change — no new dependencies or architectural changes

**Non-Goals:**
- Changing the batch API contract (`/api/raids/batch`)
- Adding optimistic update retry logic
- Restructuring the debounce mechanism itself

## Decisions

### Approach: Expose a `isTogglingRef` flag from `useRaidToggleQueue`

**Chosen approach**: Export a module-scoped `RefObject<boolean>` from `useRaidToggleQueue.ts`. Set it to `true` when `enqueue()` starts and `false` after `flush()` completes (success or error). The dashboard query's `refetchInterval` checks this flag and returns `false` (skip refetch) when a toggle is pending.

**Why this approach:**
1. **Works with React Query's `refetchInterval` function signature** — `refetchInterval` accepts `(query: Query) => number | false`. A module-level ref is accessible without hooks or context.
2. **Minimal surface area** — a single boolean ref + 2 lines changed in each file.
3. **Preserves auto-refresh** — when no toggle is in progress, `refetchInterval` continues working (friends' data still auto-refreshes).
4. **No new files** — the flag lives alongside the existing hook.

**Alternatives considered:**

| Alternative | Reason rejected |
|---|---|
| Remove `refetchInterval` entirely | Simplest fix but loses auto-refresh for friends' roster updates |
| Increase `refetchInterval` to 60s | Reduces race probability but doesn't eliminate it; also, code comment says "every 60s" but actual value is 20s — gap suggests the value isn't carefully tuned |
| Use `queryClient.setQueryDefaults` to temporarily disable `refetchInterval` | More complex API, affects global query defaults for the key |
| Restructure to `useMutation` with `onMutate`/`onSettled` | Still needs debouncing; React Query mutation doesn't natively coordinate with `refetchInterval` |

### Detailed flow

```
enqueue({ characterId, raidDifficultyId, completed })
  ├─ isTogglingRef.current = true
  ├─ cancelQueries(["dashboard"])
  ├─ snapshot cache
  ├─ setQueryData (optimistic)
  ├─ debounce 1500ms → flush()
  │    ├─ POST /api/raids/batch → { updated: N }
  │    ├─ invalidateQueries(["dashboard"])
  │    ├─ isTogglingRef.current = false  ← AFTER invalidate
  │    └─ (React Query refetches naturally)
  └─ (if flush errors)
       ├─ restore snapshot
       └─ isTogglingRef.current = false
```

During the debounce window, any `refetchInterval`-triggered fetch checks `isTogglingRef.current` → `true` → skips. After flush resolves, the flag is cleared and auto-refresh resumes.

## Risks / Trade-offs

- **Module-level mutable state**: The `RefObject` at module scope persists across renders and component unmounts. This is acceptable because the state is a transient boolean (true → false within <2s). If the component unmounts during a pending toggle, the flag stays `true` until a new mount or page reload — this is benign because the `beforeunload` handler already handles tab-close via `sendBeacon`.
- **Race on rapid toggles**: If the user toggles multiple times in quick succession, the flag stays `true` throughout, preventing any auto-refresh during the entire sequence. This is correct behavior — we don't want auto-refresh until the final flush completes.
