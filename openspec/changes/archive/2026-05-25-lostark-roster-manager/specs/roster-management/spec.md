## ADDED Requirements

### Requirement: User can create a roster
The system SHALL allow an authenticated user to create a new roster with a name.

#### Scenario: Create roster
- **WHEN** user fills in a roster name and submits
- **THEN** a new roster is created and assigned to the user

#### Scenario: Create roster with empty name
- **WHEN** user submits the form with an empty name
- **THEN** the system returns a validation error

### Requirement: User can view their rosters
The system SHALL display all rosters belonging to the authenticated user.

#### Scenario: View rosters
- **WHEN** user navigates to the rosters page
- **THEN** a list of their rosters is shown with character count per roster

### Requirement: User can update a roster
The system SHALL allow a user to edit the name of an existing roster.

#### Scenario: Update roster name
- **WHEN** user edits a roster's name and saves
- **THEN** the roster name is updated

### Requirement: User can delete a roster
The system SHALL allow a user to delete a roster and all its characters.

#### Scenario: Delete roster
- **WHEN** user confirms deletion of a roster
- **THEN** the roster and all its associated characters are deleted

#### Scenario: Delete roster with confirmation
- **WHEN** user clicks delete on a roster
- **THEN** a confirmation dialog is shown before deletion proceeds
