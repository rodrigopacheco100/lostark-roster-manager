## Context

The `raids` table has only `id` (UUID) and `name` (unique). The seed script skips raids whose `name` already exists, so renaming a raid creates a duplicate. Difficulties have a unique constraint `(raidId, difficulty)` and are tied to the raid via foreign key — no changes needed there.

## Goals / Non-Goals

**Goals:**
- Add `slug` column to `raids` as the stable identity key
- Rewrite seed to upsert by slug (match by slug, update name, sync difficulties)
- One-time migration to populate slugs for existing rows

**Non-Goals:**
- Changing `raidDifficulties` schema or constraints
- Altering conflict detection logic (`syncCharacterRaids`, `RaidCombobox`)
- Building CRUD API routes for raids
- Building admin UI

## Decisions

- **Slug convention**: kebab-case, hand-crafted (e.g., `act-4-armoche`, `shadow-raid-serca`). Stored in a `slug` text column with a unique index.
- **Seed upsert logic**: Look up raid by slug. If found, update `name` and sync difficulties (keep existing by `(difficulty name)`, add new, remove stale). If not found, insert raid + difficulties.
- **Migration**: One-time script derives slug from the current `name` field (e.g., "Act 4 - Armoche" → `act-4-armoche`). Must handle edge cases like "Final Act - Kazeros" → `final-act-kazeros`.

## Risks / Trade-offs

- **Manual slug assignment for new raids** → The seed data defines them; no auto-generation needed at runtime.
- **Slug mismatch if raid is renamed without updating seed** → The upsert by slug is resilient — if someone changes the slug in code but the DB row still has the old slug, the old raid keeps the old slug and a new one is created only if the old slug doesn't exist. This is the desired behavior.
