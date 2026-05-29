## Why

Users track their weekly raid clears manually via the dashboard, but they already have clear data in the Loa Logs local app's SQLite database. Automatically importing this data eliminates manual work and ensures accuracy.

## What Changes

- New sidebar menu item "Loa Logs" with a configuration page
- Configuration page to set the path to the `encounters.db` file and enable/disable auto-polling
- Backend service that reads the SQLite DB, filters by current weekly rotation (Wed-Tue), and imports cleared raids
- Boss name mapping from Loa Logs' `current_boss` format to our raid system (mapped by last gate boss per raid)
- Auto-polling at configurable intervals (default 10s for testing) when the user has enabled it
- Manual "Scan Now" button on the configuration page
- API endpoint(s) to trigger import and query status
- No breaking changes to existing functionality

## Capabilities

### New Capabilities
- `loa-logs-config`: Configuration UI for database file path, auto-poll toggle, and manual scan trigger
- `loa-logs-import-engine`: Backend logic to read the SQLite DB, apply weekly filter, map bosses to raids, and mark characters' raids as completed
- `boss-name-mapping`: Mapping configuration that translates `current_boss` names (Loa Logs) to internal raid slugs, keyed on the last gate of each raid

### Modified Capabilities

- (none)

## Impact

- **New dependency**: `better-sqlite3` or `sql.js` to read the Loa Logs local SQLite database from the server
- **New files**: Configuration page at `src/app/(dashboard)/loa-logs/`, API route at `src/app/api/loa-logs/`, utility modules for import logic and boss mapping
- **Modified files**: `src/components/Sidebar.tsx` (new nav item)
- **Schema changes**: `raids` table gets a new optional column `loa_logs_boss_name` for the last-gate boss name
- **No changes** to existing raid/roster/character structures
- **Config storage**: SQLite DB path stored in localStorage (client-side only), sent to the API with each request
