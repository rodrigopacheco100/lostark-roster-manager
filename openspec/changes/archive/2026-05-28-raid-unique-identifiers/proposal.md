## Why

Raids are identified by name in the seed script — renaming a raid (e.g., "Act 4 - Armoche" → "Act 4: Armoche") creates a duplicate on the next seed run because the match is by `name`. A stable slug decouples the display name from the identity key, allowing name changes without risking raid duplication.

## What Changes

- **Add `slug` column to `raids`** — unique, human-readable identifier (e.g., `act-4-armoche`), NOT NULL
- **Rewrite seed script** to upsert raids by slug — keeps existing raids and their difficulties, renames match, removes stale difficulties, adds new ones
- **No changes** to `raidDifficulties` schema, `syncCharacterRaids`, `RaidCombobox`, or conflict detection logic

## Capabilities

### New Capabilities
*(none — this is a data model and seed change only)*

### Modified Capabilities
*(none)*

## Impact

- **Schema**: `raids` table gains a `slug` column (unique, not null)
- **Seed script**: Rewritten to match by slug; old skip-by-name logic replaced with upsert
- **Migration**: One-time script to generate slugs for existing raids from their names
