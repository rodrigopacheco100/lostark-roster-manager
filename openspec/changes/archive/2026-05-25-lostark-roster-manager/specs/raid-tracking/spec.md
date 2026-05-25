## ADDED Requirements

### Requirement: User can define a raid template
The system SHALL allow an authenticated user to define a raid with a name and weekly reset day.

#### Scenario: Create raid template
- **WHEN** user creates a new raid with name and reset day
- **THEN** the raid template is available for tracking

### Requirement: User can mark a raid as completed on a character for a given week
The system SHALL allow a user to mark a raid as done or not done for each character per weekly cycle.

#### Scenario: Mark raid completed
- **WHEN** user toggles a raid as completed for a character
- **THEN** that character's completion status is saved for the current weekly cycle

#### Scenario: Mark raid not completed
- **WHEN** user toggles a raid as not completed for a character
- **THEN** that character's completion status is cleared for the current weekly cycle

### Requirement: Weekly cycle auto-resets
The system SHALL automatically reset raid completion statuses based on each raid's configured reset day.

#### Scenario: Weekly reset
- **WHEN** the reset day for a raid arrives
- **THEN** all completion statuses for that raid are reset to not completed

### Requirement: User can view raid completion per character
The system SHALL display which characters have completed which raids in the current week.

#### Scenario: View character raid status
- **WHEN** user views a character's details
- **THEN** a list of raids and their completion status for the current week is shown
