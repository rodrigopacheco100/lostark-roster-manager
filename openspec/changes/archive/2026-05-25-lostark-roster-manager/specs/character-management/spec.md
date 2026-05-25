## ADDED Requirements

### Requirement: User can add a character to a roster
The system SHALL allow a user to add a character to one of their rosters with name, class, and item level.

#### Scenario: Add character
- **WHEN** user fills in character name, class, item level and submits
- **THEN** the character is added to the selected roster

#### Scenario: Duplicate character name in same roster
- **WHEN** user tries to add a character with a name that already exists in that roster
- **THEN** the system returns a validation error

### Requirement: User can view characters in a roster
The system SHALL display all characters belonging to a roster.

#### Scenario: View characters
- **WHEN** user opens a roster
- **THEN** a list of characters is shown with name, class, and item level

### Requirement: User can update a character
The system SHALL allow a user to edit a character's name, class, or item level.

#### Scenario: Update character
- **WHEN** user edits a character's details and saves
- **THEN** the character's information is updated

### Requirement: User can delete a character
The system SHALL allow a user to remove a character from a roster.

#### Scenario: Delete character
- **WHEN** user confirms deletion of a character
- **THEN** the character is removed from the roster

### Requirement: Character has class and item level fields
The system SHALL store each character's Lost Ark class (e.g., Berserker, Paladin) and item level.

#### Scenario: Character creation requires class and item level
- **WHEN** user creates a character without specifying class or item level
- **THEN** the system returns a validation error
