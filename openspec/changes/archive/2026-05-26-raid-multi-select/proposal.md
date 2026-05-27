## Why

Adding raids to a character requires one individual select-and-submit per difficulty. With up to 3 raids per character and many characters per roster, this is repetitive. A combobox editor — searchable popover with checkboxes, showing current raids as chips — lets the user see and adjust all assignments at once and save with a single PUT.

## What Changes

- **Combobox raid editor**: Replace the single-select dropdown + "Add" button with a searchable combobox popover (following the shadcn/ui pattern). The trigger shows current raids as chips with individual X removal; the popover lists all eligible raid difficulties as grouped checkboxes.
- **Pre-selected state**: Already-assigned raids come pre-checked and visible as chips in the trigger
- **Max 3 + duplicate-raid-group enforced in UI**: User cannot check > 3 checkboxes or pick two difficulties of the same raid
- **PUT sync endpoint**: `PUT /api/characters/:id/raids` receives the desired set, diffs against DB, and applies adds + removals atomically
- **Chip X → immediate PUT**: Clicking X on a chip instantly removes that raid via PUT
- **Save button → batch PUT**: Inside the popover, Save sends the full checked set

## Capabilities

### New Capabilities
- `raid-combobox`: Combobox raid editor with search, checkboxes, chips, PUT sync

### Modified Capabilities

None — this replaces the batch-add approach with a more complete editor pattern.

## Impact

- **UI**: `src/app/(dashboard)/rosters/[id]/page.tsx` — the "Assign Raid" dropdown is removed, replaced by `RaidCombobox` component
- **API**: New `PUT /api/characters/[id]/raids` handler in the existing route file
- **DB queries**: New `syncCharacterRaids(characterId, raidDifficultyIds[])` query in `src/lib/queries.ts`
- **Components**: New `src/components/raid/RaidCombobox.tsx` — combobox with popover, search, chips, checkboxes
- **Validation**: Max-3 and duplicate-raid-group enforced in both UI (proactive) and server (defense in depth)
