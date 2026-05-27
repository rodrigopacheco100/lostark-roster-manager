## 1. Backend — Query Function

- [x] 1.1 Add `syncCharacterRaids(characterId, desiredRaidDifficultyIds)` to `src/lib/queries.ts` that: fetches current character_raids with raid+raid difficulty details, validates final state constraints (≤ 3, no duplicate raid groups, ilvl met), computes add/remove diff, and applies changes in a Drizzle transaction
- [x] 1.2 Add `getCharacterRaidsWithDetails(characterId)` helper that returns character_raids joined with raid_difficulties and raids (used by the sync function for validation)
- [x] 1.3 Fix duplicate-raid-group validation in `syncCharacterRaids`: check only within the desired set (not against existing, which includes raids being removed)

## 2. Backend — API Route

- [x] 2.1 Add a `PUT` export to the existing `src/app/api/characters/[id]/raids/route.ts` that accepts `{ raidDifficultyIds: string[] }`, calls `syncCharacterRaids`, and returns 200 with `{ added, removed }`
- [x] 2.2 Handle error responses: 400 for max raids / item level violations, 409 for duplicate raid group violations, 404 if character not found

## 3. Frontend — RaidCombobox Component

- [x] 3.1 Create `src/components/raid/RaidCombobox.tsx` that receives `character` (with `characterRaids`), `allRaids`, `rosterId`, and a `characterId` prop
- [x] 3.2 Build the trigger: a button showing selected raids as chips (each with an X to remove). The trigger shows a placeholder like "Edit Raids (X/3)" when no chips fit
- [x] 3.3 Implement the popover: absolute positioning (or portal-based) that opens on trigger click, closes on click-outside / Escape / Save, but NOT on checkbox toggle
- [x] 3.4 Implement the search input inside the popover to filter raids by name or difficulty name
- [x] 3.5 Render raid groups (raid name as header) with difficulty checkboxes; pre-check from character's existing `characterRaids`
- [x] 3.6 Implement max-3 guard: clicking a 4th unassigned checkbox is prevented; show a counter "X/3 slots used" in the footer
- [x] 3.7 Implement duplicate-raid-group guard: if a difficulty from raid X is checked, other difficulties of raid X show as disabled with explanation
- [x] 3.8 Wire the Save button to a `useMutation` calling `PUT /api/characters/:id/raids` with all checked IDs
- [x] 3.9 Wire chip X click to the same `useMutation` but with that ID removed from the set
- [x] 3.10 Handle toast + query invalidation: success → close popover, toast, invalidate roster query; error → keep popover open, error toast

## 4. Frontend — Integration into Roster Page

- [x] 4.1 Replace the "Assign Raid" button + inline `assignCharId`/`assignRaidDifficultyId` state + `availableDifficulties()` + `handleAssignRaid` with an "Edit Raids" button that sets `raidComboboxCharId` and renders `RaidCombobox`
- [x] 4.2 Remove the inline select dropdown, "Add"/"Cancel" buttons from the character card template
- [x] 4.3 Remove unused state variables: `assignCharId`, `assignRaidDifficultyId`
- [x] 4.4 Import and use `RaidCombobox` in the roster page

## 5. Verification

- [x] 5.1 Open combobox for a character with 0 raids → all eligible difficulties shown unchecked; save with 2 checked → confirms both appear on card as chips
- [x] 5.2 Open combobox for a character with 2 raids → those 2 pre-checked, shown as chips in trigger; save with no changes → confirms 0/0 response
- [x] 5.3 Open combobox for a character with 1 raid, uncheck it, check 2 new ones, save → confirms old removed, new added
- [x] 5.4 Try checking 4th checkbox → UI prevents it, counter shows 3/3
- [x] 5.5 Try checking a second difficulty of the same raid → UI prevents it
- [x] 5.6 Click X on a chip → raid removed immediately via PUT; character card updates
- [x] 5.7 Type in search → only matching raids shown
- [x] 5.8 Save with empty set on a character with 2 raids → both removed, 200 returned
- [x] 5.9 Save with 4 items via direct curl (bypassing UI) → 400 error returned
- [x] 5.10 Verify card-level X-button removal still works independently of combobox
