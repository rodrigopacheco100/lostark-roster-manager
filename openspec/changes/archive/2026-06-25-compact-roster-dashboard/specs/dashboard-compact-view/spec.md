# Dashboard Compact Layout

## ADDED Requirements

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
