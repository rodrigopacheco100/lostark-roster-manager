## ADDED Requirements

### Requirement: AGS-linked badge on roster cards
The system SHALL display a visual indicator on roster cards in the `/rosters` list page when the roster has a non-null `rosterGuid` (i.e., it was imported from or linked to an AGS API roster).

#### Scenario: Badge visible on linked roster
- **WHEN** a roster has `rosterGuid` set
- **THEN** its card in the roster list SHALL show an AGS-linked badge/icon next to the roster name

#### Scenario: No badge on unlinked roster
- **WHEN** a roster has `rosterGuid` set to null
- **THEN** its card SHALL NOT show the badge

#### Scenario: Badge does not affect roster reorder
- **WHEN** a user drags a roster card to reorder it
- **THEN** the badge SHALL NOT interfere with drag-and-drop functionality
