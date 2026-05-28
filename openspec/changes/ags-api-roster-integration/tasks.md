## 1. Environment & Schema

- [x] 1.1 Add `AGS_API_KEY` to `.env.example` and `src/lib/env.ts` validation
- [x] 1.2 Add `rosterGuid` (text, nullable) column to `rosters` table
- [x] 1.3 Add `characterGuid` (text, unique, nullable) column to `characters` table
- [x] 1.4 Change `item_level` column type from `integer` to `double precision` in `characters` table
- [x] 1.5 Run database migration (generated `0006_empty_omega_red.sql` — needs PostgreSQL to apply)

## 2. AGS API Client

- [x] 2.1 Create `src/lib/ags-api.ts` with typed interfaces (`AGSCharacter`, `AGSRoster`, `AGSCombatPower`)
- [x] 2.2 Implement `getCharacterByName(region, name)` — calls `GET /api/v1/mirth/characters/by-name/{region}/{name}` with `x-api-key` header
- [x] 2.3 Implement `getRosterByGuid(guid)` — calls `GET /api/v1/mirth/rosters/by-guid/{guid}` with `x-api-key` header
- [x] 2.4 Add env validation for `AGS_API_KEY` in `src/lib/env.ts` with descriptive error

## 3. Class Mapping

- [x] 3.1 Create `src/lib/ags-class-map.ts` with `mapAGSClassToLostArk(agsClassName: string): LostArkClass`
- [x] 3.2 Add all known API class name mappings (warrior, mage, martial artist, assassin, gunner, specialist, guardian knight variants)
- [x] 3.3 Add fallback default for unknown class names

## 4. Server-Side Preview API

- [x] 4.1 Create `src/app/api/rosters/[id]/characters/preview/route.ts` — `POST` handler accepting `{ region, characterName }`
- [x] 4.2 In the handler: call `getCharacterByName` → extract `roster_guid` → call `getRosterByGuid`
- [x] 4.3 Map each API character's class via `mapAGSClassToLostArk`
- [x] 4.4 Return `{ rosterGuid, characters: [...] }` to the client (do NOT persist yet)
- [x] 4.5 Cross-reference returned characters against existing characters in the roster by `characterGuid` and mark which ones are already present

## 5. Server-Side Bulk Import API

- [x] 5.1 Create `src/app/api/rosters/[id]/characters/bulk/route.ts` — `POST` handler accepting `{ characters: [...] }`
- [x] 5.2 In the handler: insert each character, skip any where `characterGuid` already exists in this roster
- [x] 5.3 Update roster's `rosterGuid` if not already set
- [x] 5.4 Return the created characters

## 6. Roster Import UI

- [x] 6.1 Create `ImportRosterModal` component with: region input (default "NA"), character name input, "Search" button
- [x] 6.2 Add "Import Characters" button to `src/app/(dashboard)/rosters/[id]/page.tsx` that opens the modal
- [x] 6.3 Implement search flow: `POST /api/rosters/[id]/characters/preview` → display roster preview with character cards (class icon, name, item level, checkbox)
- [x] 6.4 Mark already-imported characters as disabled in the preview
- [x] 6.5 Implement confirm import: `POST /api/rosters/[id]/characters/bulk` with selected characters
- [x] 6.6 Handle success: close modal, invalidate roster detail query, show toast
- [x] 6.7 Handle loading and error states throughout the flow

## 7. Polish & Verify

- [x] 7.1 Run `npm run lint` and `npm run typecheck` — fix any issues
- [x] 7.2 Build project and verify no compilation errors
- [ ] 7.3 Manual smoke test: import characters into a roster, verify display, verify duplicates are skipped, verify manual add still works
