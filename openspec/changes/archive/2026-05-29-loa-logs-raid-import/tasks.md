## 1. Database Schema & Dependencies

- [x] 1.1 Install `sql.js` and `@types/sql.js` npm packages (replaced better-sqlite3)
- [x] 1.2 Add `loa_logs_boss_name` and `loa_logs_difficulty` columns to `raid_difficulties` table
- [x] 1.3 Drop `loa_logs_boss_name` from `raids` table
- [x] 1.4 Run migrations

## 2. Boss Name Mapping

- [x] 2.1 Create `src/lib/loa-logs/boss-mappings.ts` with per-difficulty boss name mappings
- [x] 2.2 Update seed data with `loaLogsBossName` and `loaLogsDifficulty` per difficulty
- [x] 2.3 Seed updates existing difficulties with Loa Logs columns

## 3. Client-Side SQLite Engine

- [x] 3.1 Create `src/lib/loa-logs/weekly-window.ts` (Wed 07:00 UTC window)
- [x] 3.2 Create `src/lib/loa-logs/client.ts` with `loadEncounters()` using sql.js WASM
- [x] 3.3 Create `src/lib/loa-logs/matchEncounters()` — boss lookup + character + difficulty matching
- [x] 3.4 Configure WASM file serving via `public/sql/sql-wasm-browser.wasm`

## 4. File Handle Persistence

- [x] 4.1 Create `src/lib/loa-logs/file-handle.ts` — IndexedDB persistence for `FileSystemFileHandle`
- [x] 4.2 Implement `queryPermission`/`requestPermission` for cross-session access

## 5. Auto-Polling

- [x] 5.1 Create `src/components/LoaLogsPoller.tsx` — provider + context + polling interval (30s)
- [x] 5.2 Integrate poller into dashboard layout (global across all authenticated pages)
- [x] 5.3 Track last processed encounter ID to avoid duplicates
- [x] 5.4 Invalidate `/api/raids` and `dashboard` query caches on import

## 6. Config Page

- [x] 6.1 Create `src/app/(dashboard)/loa-logs/page.tsx` with connect/disconnect UI
- [x] 6.2 Add `/loa-logs` nav link in `src/components/Sidebar.tsx` with custom SVG icon

## 7. Migration & Cleanup

- [x] 7.1 Remove server-side API routes (scan, status, upload)
- [x] 7.2 Remove better-sqlite3 dependency
- [x] 7.3 TypeScript declarations for File System Access API

## 8. Verification

- [x] 8.1 Build passes
- [x] 8.2 Client-side SQLite loads encounters from encounters.db
- [x] 8.3 Character matching works with accented names
- [x] 8.4 Permission re-grant on page reload
- [x] 8.5 Dashboard cache invalidated on import
