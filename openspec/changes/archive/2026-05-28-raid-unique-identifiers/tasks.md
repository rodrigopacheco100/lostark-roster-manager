## 1. Schema & Migration

- [x] 1.1 Add `slug` column to `raids` table (text, unique, nullable initially for existing rows)
- [x] 1.2 Populate slugs for existing rows via UPDATE SQL in migration (regexp_replace from name)
- [x] 1.3 Alter `raids.slug` to NOT NULL and add unique constraint
- [x] 1.4 Add explicit indexes on `raids.slug` and `raids.name`

## 2. Seed Script Rewrite

- [x] 2.1 Add `slug` field to `RaidDataItem` type and assign slugs to all 6 entries
- [x] 2.2 Rewrite seed to upsert by slug (match on slug → update name → sync difficulties)
- [x] 2.3 Implement difficulty sync: keep existing by name, add new, remove stale
- [x] 2.4 Wrap seed in a `db.transaction()` for atomicity
- [x] 2.5 Update `createRaid()` query to require slug parameter
