## Context

The initial Loa Logs integration persisted the `FileSystemFileHandle` in IndexedDB and used a simple scalar `lastEncounterId` in localStorage for checkpoint tracking. This worked for normal usage but had issues:
- When the user replaced their `encounters.db` (new Loa Logs install), encounter IDs became meaningless — old IDs didn't exist in the new DB, causing the system to stop detecting new clears
- The checkpoint couldn't verify if the underlying DB had been swapped
- No visible feedback of what was imported (just a transient toast)

## Goals / Non-Goals

**Goals:**
- Detect DB replacement and reset checkpoint automatically
- Unified file selector (click + drag-and-drop)
- Replace success toasts with persistent import history
- Reduce polling interval to 60s
- Deduplicate imports by SQLite `fight_start` timestamp
- Persist import history in localStorage

**Non-Goals:**
- UI polish beyond the import history table (no filtering/search)
- Server-side import history (all client-side)
- Exporting import history

## Decisions

### 1. Structured checkpoint with verification
**Decision**: Replace `lastEncounterId` scalar with `EncounterCheckpoint { id, bossName, difficulty, playerName }`. On each poll, if zero encounters are found above the checkpoint ID, verify the checkpoint encounter still exists in the DB. If not, assume DB was reset and start from ID=0.
**Rationale**: The tuple (bossName + difficulty + playerName) is stable across Loa Logs DB dumps — even if IDs change, the same encounter will have the same boss, difficulty, and player name. This reliably detects DB resets without false positives.

### 2. IndexedDB + localStorage hybrid
**Decision**: `FileSystemFileHandle` persisted in IndexedDB (required by browser — structured clone). File metadata and import history in localStorage (JSON serializable).
**Rationale**: The `FileSystemFileHandle` object cannot be serialized to JSON/localStorage. IndexedDB supports structured clone and is the only client-side storage that can persist it. localStorage is fine for the metadata/checkpoint/history since those are plain objects.

### 3. Drag-and-drop via getAsFileSystemHandle
**Decision**: Use `DataTransferItem.getAsFileSystemHandle()` on drop events to obtain a `FileSystemFileHandle`, then pass it through the same `connect()` flow as the file picker.
**Rationale**: Same handle type, same permission model, same storage. No code duplication. Fallback: if unsupported, show toast suggesting the button.

### 4. Import dedup by (fightStart, characterName, bossName)
**Decision**: Before calling the batch API, filter matches against a set of already-imported tuples from localStorage. Store entries with `{ fightStart, importedAt, bossName, characterName, difficulty }`.
**Rationale**: `fight_start` is unique per encounter in Loa Logs and survives DB resets. Combined with character/boss name, it's a stable dedup key across DB dumps.

### 5. Infinite scroll via scroll event
**Decision**: Render a `max-h-64 overflow-y-auto` container with a scroll listener. Start at 30 items, load 20 more when within 150px of the bottom.
**Rationale**: Simple and dependency-free. The table is read-only (no virtual DOM needed). localStorage caps at 500 entries, so even full data is manageable.

## Risks / Trade-offs

- **[Permission loss between sessions]** → The handle in IndexedDB loses its permission grant on page reload. The system checks `queryPermission()` on mount and only auto-starts polling if `"granted"`. Otherwise the user must re-click to re-authorize. This is a browser-level restriction.
- **[Import history localStorage limit]** → MAX_HISTORY cap of 500 entries (~100KB). If the user has many weekly clears across many characters, older entries will be evicted. Trade-off: localStorage is cheap and synchronous.
- **[Browser support for getAsFileSystemHandle]** → Only Chrome/Edge 86+. On Firefox/Safari, drag-and-drop falls back to a toast suggesting the file picker. The file picker (showOpenFilePicker) has the same browser support gap, so this is consistent.
