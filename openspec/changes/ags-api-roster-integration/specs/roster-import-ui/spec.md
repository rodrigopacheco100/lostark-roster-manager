## ADDED Requirements

### Requirement: Roster detail page SHALL have an "Import Characters" button
The roster detail page SHALL display an "Import Characters" button near the character list area.

#### Scenario: Button renders on roster detail page
- **WHEN** the user navigates to a roster detail page (`/rosters/:id`)
- **THEN** an "Import Characters" button is visible

### Requirement: Import button SHALL open a modal with search form
Clicking the "Import Characters" button SHALL open a modal containing a region input (default "NA"), a character name input, and a "Search" button.

#### Scenario: Modal opens with default values
- **WHEN** the user clicks "Import Characters"
- **THEN** a modal opens with region pre-filled to "NA", an empty character name field, and a disabled "Search" button

#### Scenario: Search button enables when character name is non-empty
- **WHEN** the user types a character name
- **THEN** the "Search" button becomes enabled

#### Scenario: Modal closes on X click
- **WHEN** the user clicks the close button on the modal
- **THEN** the modal closes

### Requirement: Search SHALL call the server-side preview API and display roster characters
When the user submits the search, the system SHALL call `POST /api/rosters/:id/characters/preview` with `{ region, characterName }` and display the resulting roster's characters with class icon, name, and item level.

#### Scenario: Loading state during search
- **WHEN** the user clicks "Search"
- **THEN** a loading spinner is shown while the API call is in progress

#### Scenario: Successful search shows character list
- **WHEN** the API returns a roster
- **THEN** the modal shows a list of all characters with their class icon, name, item level, and a checkbox (checked by default)

#### Scenario: Already-imported characters show as disabled
- **WHEN** a character from the API is already in the current roster (matched by `characterGuid`)
- **THEN** that character's checkbox is disabled with a "Already in roster" label

#### Scenario: Search error shows toast
- **WHEN** the API returns an error (character not found, API down, etc.)
- **THEN** a toast with the error message is shown and the modal stays open

### Requirement: User SHALL be able to select which characters to import
Each character in the preview list SHALL have a checkbox. The user SHALL be able to check or uncheck individual characters.

#### Scenario: All characters checked by default
- **WHEN** the roster preview loads
- **THEN** all character checkboxes are checked

#### Scenario: User can uncheck characters
- **WHEN** the user clicks a character's checkbox
- **THEN** that character is unchecked and will not be imported

#### Scenario: Import button disabled when no characters selected
- **WHEN** all character checkboxes are unchecked
- **THEN** the "Import" button is disabled

### Requirement: Confirm import SHALL add selected characters to the current roster
When the user clicks "Import" with at least one character selected, the system SHALL call `POST /api/rosters/:id/characters/bulk` with `{ characters: [...] }` to add them to the current roster, then invalidate the roster detail query.

#### Scenario: Successful import adds characters
- **WHEN** the user clicks "Import" with valid data
- **THEN** the selected characters are added to the roster, a success toast is shown, the modal closes, and the roster detail view refreshes

#### Scenario: Import mutation loading state
- **WHEN** the import is in progress
- **THEN** the "Import" button shows a loading state and is disabled

#### Scenario: Already-imported characters are skipped
- **WHEN** the user imports characters that already exist in the roster
- **THEN** duplicate characters (matched by `characterGuid`) are silently skipped

### Requirement: Item level SHALL be stored as decimal
The `item_level` column in the `characters` table SHALL support decimal values to match the API's floating-point item levels.

#### Scenario: Decimal item level stored
- **WHEN** a character with item level 1758.3334 is imported
- **THEN** the value 1758.3334 is stored in the database

## MODIFIED Requirements

<!-- No existing roster-import spec to modify; all requirements are new -->
