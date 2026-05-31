## Why

The initial Loa Logs integration worked but had rough edges: polling was too aggressive (30s), success toasts were noisy when running automatically, the file selector didn't support drag-and-drop, and there was no visible history of what got imported. The checkpoint system also failed to detect when the user's encounters.db was replaced (DB reset), causing stale imports.

## What Changes

- **Unified file selector**: Drag-and-drop zone doubles as a click-to-select area. FileSystemFileHandle persisted in IndexedDB for cross-session access. localStorage stores file name for UI.
- **Enhanced checkpoint**: Replaced `lastEncounterId` number with structured `EncounterCheckpoint { id, bossName, difficulty, playerName }`. On each poll, verifies the checkpoint encounter still exists in the DB; if not, resets to start from scratch (detects DB replacement).
- **Remove success toast**: Instead of a toast on every auto-import cycle, the system now tracks an import history list.
- **Polling interval**: Changed from 30s to 60s to reduce overhead.
- **Import dedup**: Tracks `fight_start` timestamp from SQLite per encounter+character+boss to prevent duplicate imports across sessions.
- **Import history UI**: Scrollable table below the connection card showing recent imports (boss, character, difficulty, time), with infinite scroll to handle large datasets without excessive rendering.
- **Drag-and-drop**: User can drop `encounters.db` onto the drop zone to connect, using `DataTransferItem.getAsFileSystemHandle()`. Falls back gracefully if the browser doesn't support it.

## Capabilities

### Modified Capabilities
- `loa-logs-config`: Connection UX changed (unified click+drop selector, 60s polling, no success toast, import history display). Checkpoint storage schema changed from scalar ID to structured object.
- `loa-logs-import-engine`: Import engine now tracks `fight_start` for dedup, returns it in query results, and filters against imported timestamp history.

### New Capabilities
- (none)

## Impact

- `src/lib/loa-logs/file-handle.ts`: Added IndexedDB handle persistence, drag-drop helper, import history localStorage functions
- `src/lib/loa-logs/client.ts`: Added `fight_start` to SQL SELECT and MatchResult type
- `src/components/LoaLogsPoller.tsx`: 60s interval, checkpoint verification, import history tracking, dedup by timestamp
- `src/app/(dashboard)/loa-logs/page.tsx`: Unified drop zone + file picker, import history table with infinite scroll
