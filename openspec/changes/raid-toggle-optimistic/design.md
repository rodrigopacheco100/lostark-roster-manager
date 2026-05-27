## Context

The dashboard's `RaidCheckbox` toggles a raid's `completed` field. Previously each toggle sent a `PATCH /api/characters/:id/raids` and awaited the server — ~300-800ms lag per click. With 20+ raids to toggle across a roster, the UX suffered.

The new approach batches toggles: optimistic cache update on every click (instant), then a single `POST /api/raids/batch` after 1.5s of inactivity.

## Goals / Non-Goals

**Goals:**
- Raid checkbox flips instantly on click
- Multiple toggles in rapid succession → 1 request (debounced 1.5s)
- Same raid toggled twice → only the last value is sent
- Server failure → all toggles revert to pre-batch snapshot
- Page close during debounce → `sendBeacon` guarantees delivery
- Full invalidation on success for eventual consistency

**Non-Goals:**
- Loading spinners or success toasts (optimistic UI replaces them)
- Changing individual PATCH endpoints (they stay for non-batch use)
- WatermelonDB or client-side DB (overkill for a single boolean)

## Decisions

### 1. Hook with shared mutable refs, not context

A queue with timer and snapshot must be shared by all `RaidCheckbox` instances. Using a hook at `DashboardPage` level and passing `enqueue` via props avoids context boilerplate and keeps the queue lifecycle tied to the page mount.

### 2. `Map<string, ToggleEntry>` for dedup

Key = `characterId:raidDifficultyId`. Ensures the same character+raid combination can only have one pending toggle — last write wins. No stale intermediate states.

### 3. Snapshot on first enqueue, restore on batch failure

The snapshot is taken when `queueRef` transitions from empty → non-empty. If the batch POST fails, the **entire** snapshot is restored, reverting all optimistic flips. This is simpler than tracking per-entry rollback and matches user expectations ("none of my toggles went through").

### 4. sendBeacon on beforeunload

`beforeunload` doesn't wait for async operations. `navigator.sendBeacon` is synchronous from the browser's perspective — it queues the request and the browser guarantees delivery even if the page is torn down. Session cookies are sent automatically.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| Debounce delay means toggles aren't persisted until 1.5s idle | `sendBeacon` on page close prevents data loss; user rarely closes immediately after a toggle |
| `structuredClone` snapshot size (full dashboard cache) | Dashboard is tiny (<50 raids); clone is ~1µs |
| Batch POST partially fails (some updates succeed, some fail) | Transaction wraps all updates; failure rolls back all — atomic |

## Implementation

### Architecture

```
DashboardPage
  └─ useRaidToggleQueue() → { enqueue }
       ├─ queueRef: Map<"charId:raidId", ToggleEntry>
       ├─ snapshotRef: DashboardData | null
       └─ timerRef: Timeout
       ├─ enqueue(entry)
       │    ├─ on 1st item: cancel refetches + snapshot cache
       │    ├─ add/overwrite entry (dedup by key)
       │    ├─ flip cache instantly (optimistic)
       │    └─ reset 1.5s debounce timer
       ├─ flush()
       │    ├─ POST /api/raids/batch { updates }
       │    ├─ 200 → invalidate dashboard
       │    └─ error → restore snapshot
       └─ beforeunload → sendBeacon("/api/raids/batch", updates)
```

### Data flow

```
User clicks ✓ or ✗
  → enqueue({ characterId, raidDifficultyId, completed })
    → UI flips instantly (cache.setQueryData)
    → timer reset to 1.5s
  [user clicks more raids, queue grows]
  ── after 1.5s idle ──
  → flush()
    → POST /api/raids/batch { updates: [...] }
      → 200: invalidateQueries(["dashboard"])
      → error: setQueryData(["dashboard"], snapshot)  // rollback all

  ── if page closes during timer ──
  → sendBeacon("/api/raids/batch", JSON.stringify({ updates }))
    → browser guarantees delivery
```
