## ADDED Requirements

### Requirement: OwnerSection collapse header displays per-owner circular progress

Each `OwnerSection` collapse header SHALL display a circular progress bar on the right side showing the completion percentage for that owner's rosters.

#### Scenario: Owner has rosters with assigned raids
- **WHEN** an `OwnerSection` renders with roster data that includes assigned raids
- **THEN** a circular progress bar SHALL appear right-aligned in the collapse header button row
- **AND** the circle SHALL display the completion percentage (e.g., "67%") centered inside it
- **AND** the progress SHALL be computed from all characters and raids under that owner

#### Scenario: Owner has no assigned raids
- **WHEN** an `OwnerSection` renders with zero assigned raids across all rosters
- **THEN** the circular progress SHALL show "0%" with a gray ring

#### Scenario: Owner has all raids completed
- **WHEN** all raids across an owner's rosters are marked completed
- **THEN** the circular progress SHALL show "100%" with a green ring

### Requirement: Circular progress bar uses color gradient

The circular progress bar stroke color SHALL transition based on the completion percentage using a continuous gradient.

#### Scenario: Progress at 0%
- **WHEN** the completion percentage is exactly 0%
- **THEN** the ring color SHALL be gray (`#6b7280`)

#### Scenario: Progress at 1-49%
- **WHEN** the completion percentage is between 1% and 49%
- **THEN** the ring color SHALL interpolate from red (`#ef4444`) toward yellow (`#eab308`)

#### Scenario: Progress at 50-99%
- **WHEN** the completion percentage is between 50% and 99%
- **THEN** the ring color SHALL interpolate from yellow (`#eab308`) toward green (`#22c55e`)

#### Scenario: Progress at 100%
- **WHEN** the completion percentage is exactly 100%
- **THEN** the ring color SHALL be green (`#22c55e`)

### Requirement: Circular progress ring animates smoothly

The progress ring stroke SHALL animate smoothly when the percentage value changes, using a CSS transition on `stroke-dashoffset`.

#### Scenario: Percentage increases
- **WHEN** the completion percentage changes from a lower to a higher value
- **THEN** the progress ring SHALL animate from the old position to the new position over approximately 600ms with an ease timing function

#### Scenario: Percentage decreases
- **WHEN** the completion percentage changes from a higher to a lower value
- **THEN** the progress ring SHALL animate from the old position to the new position over approximately 600ms with an ease timing function
