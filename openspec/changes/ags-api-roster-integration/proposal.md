## Why

Roster management is currently fully manual — users must type character names, select classes, and enter item levels by hand. This is tedious, error-prone, and doesn't reflect the user's actual in-game roster. Integrating with the ags.lol API lets users import their real Lost Ark roster with one click.

## What Changes

- Add `AGS_API_KEY` env var for the external API
- Create an ags.lol API client (axios-based, with x-api-key header)
- Add `characterGuid` and `rosterGuid` columns to the `rosters` and `characters` tables
- Add an "Import Characters" button on the roster detail page
- Add an import modal with: region input, character name search, roster preview with character selection
- Map API class names to the existing `LostArkClass` enum
- Manual character creation is preserved — both manual and import flows coexist

## Capabilities

### New Capabilities
- `ags-api-client`: HTTP client wrapping the ags.lol external API (character by name, roster by GUID), using x-api-key auth
- `roster-import-ui`: Modal-based import flow on the roster detail page — search character by region+name, preview all roster characters, select which to add to the current roster
- `ags-class-mapping`: Mapping table from ags.lol API class names to the internal `LostArkClass` enum

### Modified Capabilities
- `roster-crud`: Extend schema with `characterGuid` and `rosterGuid` fields; add bulk character insert endpoint for imports
- `http-client`: No changes (the ags.lol client is separate from the internal HTTP client)

## Impact

- **Schema**: New columns `characterGuid` (text, unique, nullable) on `characters`, `rosterGuid` (text, nullable) on `rosters`
- **DB queries**: Update `createCharacter` to accept `characterGuid`; add `findRosterByGuid` query; may need migration script
- **API routes**: New route `POST /api/rosters/:id/characters/bulk` for importing characters into an existing roster
- **Pages**: Roster detail page gets "Import Characters" button; manual add-character form remains available
- **Env**: `AGS_API_KEY` required in `.env.example` and validated at runtime
- **Dependencies**: No new npm packages (reuse existing axios)
