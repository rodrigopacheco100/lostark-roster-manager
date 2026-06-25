## 1. Data preparation

- [x] 1.1 Update the `Roster` type in `src/app/(dashboard)/rosters/page.tsx` to include full character data (class, itemLevel, characterGuid, characterRaids with nested raid data)
- [x] 1.2 Verify `GET /api/rosters` already returns the nested data needed (no API changes required)

## 2. Collapsible roster sections

- [x] 2.1 Add `expandedRosters: Set<string>` state to track which roster sections are open
- [x] 2.2 Wrap each roster card's character content in a collapsible container, toggled by clicking the roster header area
- [x] 2.3 Show character count and expansion chevron/icon on the roster header

## 3. Inline character CRUD

- [x] 3.1 Add "Add Character" form inside each expanded roster section (name, class select, item level input)
- [x] 3.2 Implement create mutation calling `POST /api/rosters/{rosterId}/characters` with toast feedback
- [x] 3.3 Display character rows with class badge, item level, edit/delete buttons
- [x] 3.4 Implement inline edit mode per character row (edit name, class, item level fields)
- [x] 3.5 Implement delete with confirm dialog per character row

## 4. Inline raid assignment

- [x] 4.1 Add a raid assignment button per character row (e.g., a badge/chip showing assigned raids count)
- [x] 4.2 Integrate RaidCombobox per character, toggled by the raid button
- [x] 4.3 Show assigned raid badges with remove buttons inline on the character row

## 5. Inline character reorder

- [x] 5.1 Add per-section reorder toggle button inside the expanded roster section
- [x] 5.2 Implement reorder drag handles on character rows using SortableList (nested within the section)
- [x] 5.3 Add inline save/discard buttons at the bottom of the section during reorder mode

## 6. Inline AGS character import

- [x] 6.1 Add "Import Characters" button inside expanded roster section when `rosterGuid` is set
- [x] 6.2 Wire button to open `AddRosterCharactersModal` (pass roster ID and refetch callback)

## 7. Verification

- [x] 7.1 Run `npm run typecheck` and fix any type errors
- [x] 7.2 Run `npm run lint` and fix any lint errors
- [x] 7.3 Start dev server and verify: expand/collapse, add/edit/delete characters, assign raids, reorder characters, import from AGS
- [x] 7.4 Remove `/rosters/[id]` detail page and its link
