## Purpose

Define the compact dashboard view layout for displaying all rosters and characters of an owner inline within a single collapsible section.
## Requirements
### Requirement: All rosters of an owner appear inline within the same collapsible section

When the owner's collapsible section is expanded, all their rosters SHALL be shown inline (not inside nested collapsible Cards). Each roster SHALL be visually separated by a styled divider that displays the roster name.

#### Scenario: Expanded owner shows all rosters with dividers
- **WHEN** a user expands an owner section that has 2 or more rosters
- **THEN** all rosters render within that same expanded area
- **AND** each roster is preceded by a visual divider labeled with the roster name

### Requirement: Characters are displayed in a table-like grid layout

Characters within a roster SHALL be displayed as rows in a compact grid layout. Each row SHALL contain the character name, class, item level, and raid toggle pills on the same horizontal axis. The grid SHALL use minimal vertical spacing.

#### Scenario: Character row renders inline data
- **WHEN** a roster with a character that has 3 assigned raids is rendered
- **THEN** the character row shows name, class badge, item level, and all 3 raid toggle pills in a single row
- **AND** the row height is compact (no extra padding beyond the content)

### Requirement: Per-roster aggregate summary pills are removed

Roster-level aggregate summary pills (showing `completed/total RaidName (difficulty)`) SHALL NOT be rendered. Only the per-owner aggregate summary pills persist above the roster list.

#### Scenario: No duplicate summary pills below owner level
- **WHEN** an owner section is expanded
- **THEN** no raid summary pills appear between the owner header and the first roster divider

### Requirement: Raid toggle functionality is preserved

Each raid pill within the compact table layout SHALL remain a clickable toggle button. The toggle SHALL call `enqueue` with the same `ToggleEntry` payload as the current `RaidCheckbox` component. The existing optimistic update + debounced batch logic SHALL be unchanged.

#### Scenario: Raid pill toggles correctly in table layout
- **WHEN** a user clicks a raid pill in the compact table layout
- **THEN** the `enqueue` function is called with `{ characterId, raidDifficultyId, completed: !completed }`
- **AND** the UI updates optimistically within the same render cycle

### Requirement: Collapse state is removed from individual rosters

Rosters SHALL NOT have their own collapsed/expanded state. When the parent owner section is expanded, all of its rosters SHALL be visible. The only collapse control is at the owner level.

#### Scenario: No individual roster collapse control
- **WHEN** an owner section is expanded
- **THEN** the roster name divider does not act as a collapse toggle
- **AND** no chevron icon appears next to the roster name divider

### Requirement: Roster separator divider uses a styled pill-and-line pattern

The roster divider SHALL consist of a horizontal line with the roster name displayed as an inline pill/badge in the center, following the visual pattern used by the raid selector combobox (divider line with label).

#### Scenario: Roster divider renders with name pill
- **WHEN** a roster divider is rendered
- **THEN** it shows a full-width horizontal line (border)
- **AND** the roster name appears as a styled pill/badge centered on the line
- **AND** the pill uses muted text color (e.g., `text-gray-500`) to de-emphasize it relative to content

### Requirement: Owner avatar renders at 32x32px

The owner avatar (image or initial fallback) in the owner section header SHALL render at 32x32px (`h-8 w-8`) instead of the previous 24x24px (`h-6 w-6`).

#### Scenario: Owner image displays at 32x32
- **WHEN** an owner has a profile image
- **THEN** the Image element has `width={32}` and `height={32}` attributes
- **AND** the className includes `h-8 w-8`

#### Scenario: Owner initial fallback displays at 32x32
- **WHEN** an owner has no profile image
- **THEN** the fallback letter container uses `h-8 w-8` dimensions

### Requirement: Owner-level raid summary pills SHALL be inline in the header row

The per-owner raid summary pills SHALL be rendered inside the same flex container as the owner name (left-aligned, immediately after the name `<h2>`), instead of in a separate row below the header. The pills SHALL be wrapped in a `flex flex-wrap gap-1` container and only render when there is at least one raid group.

The previous dedicated pill row below the header SHALL be removed.

#### Scenario: Pills render next to owner name
- **WHEN** an owner section is rendered and the owner has raid data
- **THEN** the raid summary pills appear immediately after the owner name, inside the same flex container, left-aligned
- **AND** no pill row exists below the header button

#### Scenario: No pills when no raids
- **WHEN** an owner section is rendered and the owner has no raid data
- **THEN** no raid summary pills are rendered in the header

#### Scenario: All-completed pill renders green
- **WHEN** a raid group has all instances completed (e.g., 4/4 Akkan Hard)
- **THEN** the pill for that raid uses green styling (`bg-green-900/40 text-green-400`)

#### Scenario: Partial-completed pill renders neutral
- **WHEN** a raid group has some incomplete instances (e.g., 2/4 Akkan Hard)
- **THEN** the pill for that raid uses neutral styling (`bg-surface-hover text-gray-400`)

