## 1. Restructure OwnerSection

- [x] 1.1 Inline roster iteration and character rendering into `OwnerSection.tsx`, replacing `RosterSection`
- [x] 1.2 Remove per-roster collapse state and aggregate summary pills
- [x] 1.3 Add background (`bg-surface`) and border to owner collapse wrapper

## 2. Create Roster Header Component

- [x] 2.1 Create `RosterDivider` — initially line+pill, later changed to simple text header matching `RaidCombobox` style
- [x] 2.2 Render `RosterDivider` before each roster's table

## 3. Migrate to HTML Table

- [x] 3.1 Create reusable `Table` component (`src/components/ui/Table.tsx`) with compound API (Root, Head, Header, Body, Row, Cell)
- [x] 3.2 Export `Table` from `src/components/ui/index.ts`
- [x] 3.3 Replace `CharacterRow` flex/grid layout with proper `<table>` in `OwnerSection`
- [x] 3.4 Force auto-width on Name and ilvl columns (`w-[1%] whitespace-nowrap`)
- [x] 3.5 Delete `CharacterRow.tsx` (no longer needed)

## 4. Roster Card Visual

- [x] 4.1 Wrap each roster in a card-like container (`bg-surface-elevated`, border, rounded)

## 5. Class Icons

- [x] 5.1 Remove Class column from table
- [x] 5.2 Add `mappedIconsByClass` lookup in Name cell — icon rendered left of character name
- [x] 5.3 Add fallback for missing icons (circle with first letter)
- [x] 5.4 Comment out missing class icon imports in `src/assets/classes/index.ts`
- [x] 5.5 Change mapper type to `Partial<Record<LostArkClass, ...>>`

## 6. Cleanup

- [x] 6.1 Remove raid counter (`completed/total`) per character
- [x] 6.2 Run lint and typecheck — no errors
