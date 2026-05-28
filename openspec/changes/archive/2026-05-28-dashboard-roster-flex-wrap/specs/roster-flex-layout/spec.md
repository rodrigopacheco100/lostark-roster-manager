# Roster Flex Layout

## ADDED Requirements

### Requirement: Dashboard rosters display in flexible multi-column layout
Rosters within an owner section SHALL be arranged in a flex-wrap container so they sit side-by-side when horizontal space permits, and wrap to new rows when space is insufficient.

#### Scenario: Wide viewport shows rosters in multiple columns
- **WHEN** the dashboard is viewed on a screen wider than 768px
- **THEN** rosters within an expanded owner section SHALL display in multiple columns (2+), with each roster card having a minimum width of 620px

#### Scenario: Narrow viewport shows rosters in single column
- **WHEN** the dashboard is viewed on a screen narrower than 768px
- **THEN** rosters within an expanded owner section SHALL display in a single column, each card taking full container width

#### Scenario: Mixed-length rows wrap correctly
- **WHEN** an owner has N rosters that cannot all fit in one row
- **THEN** the overflow roster(s) SHALL wrap to the next row, maintaining consistent gap spacing

#### Scenario: No behavioral regression
- **WHEN** a user interacts with any roster card (raid toggle, collapse/expand owner)
- **THEN** all existing interactions SHALL work identically to the single-column layout
