## 1. Enhanced Checkpoint System

- [x] 1.1 Replace `getLastEncounterId`/`setLastEncounterId` with structured `EncounterCheckpoint { id, bossName, difficulty, playerName }` in file-handle.ts
- [x] 1.2 Add checkpoint verification to `loadEncounters()` in client.ts — if zero results found above checkpoint ID, verify checkpoint encounter exists; if not, reset to ID=0
- [x] 1.3 Update LoaLogsPoller to use new checkpoint functions and handle `checkpointReset` flag

## 2. IndexedDB Handle Persistence + Drag-and-Drop

- [x] 2.1 Restore IndexedDB functions (`storeFileHandle`, `getStoredHandle`, `removeStoredHandle`) in file-handle.ts
- [x] 2.2 Add `handleFromDrop()` for drag-and-drop via `DataTransferItem.getAsFileSystemHandle()`
- [x] 2.3 Add `clearAllStorage()` to clean IDB + localStorage in one call
- [x] 2.4 Update LoaLogsPoller: on mount, load handle from IDB and auto-start polling if permission granted
- [x] 2.5 Update LoaLogsPoller: `connect()` accepts optional handle (picker or drag-drop), saves to IDB + localStorage
- [x] 2.6 Unify loa-logs page drop zone with click-to-select — single area handles both

## 3. Remove Toast + 60s Polling

- [x] 3.1 Change `POLL_INTERVAL` from 30_000 to 60_000
- [x] 3.2 Remove `toast.success()` call for auto-imported raids
- [x] 3.3 Update page text to reflect "polls every minute"

## 4. Import History with Dedup

- [x] 4.1 Add `fight_start` to SQL SELECT and `EncounterRow` type in client.ts
- [x] 4.2 Add `difficulty` and `fightStart` to `MatchResult` type
- [x] 4.3 Add `ImportEntry` type, `getImportHistory()`, `addImportHistory()`, `clearImportHistory()` in file-handle.ts (localStorage, max 500 entries)
- [x] 4.4 Filter matches against import history timestamps before batch API call
- [x] 4.5 Store new import entries after successful batch
- [x] 4.6 Expose `recentImports` and `lastImportAt` via poller context

## 5. Import History UI

- [x] 5.1 Add scrollable table (`max-h-64 overflow-y-auto`) with Boss, Character, Difficulty, When columns
- [x] 5.2 Implement infinite scroll: start at 30 items, load 20 more when near bottom
- [x] 5.3 Show "Last import: Xm ago" text when connected
- [x] 5.4 Format timestamps as relative time (s/m/h/d ago)
