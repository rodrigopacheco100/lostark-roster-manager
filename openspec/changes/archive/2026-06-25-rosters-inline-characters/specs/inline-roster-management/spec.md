## ADDED Requirements

### Requirement: Collapsible roster sections
The system SHALL display each roster's characters in a collapsible section on the `/rosters` page, toggled by clicking on the roster header.

#### Scenario: Expand roster section
- **WHEN** the user clicks on a roster header on the `/rosters` page
- **THEN** the roster's character section SHALL expand to show its characters and management controls
- **AND** clicking the same header again SHALL collapse the section

#### Scenario: Multiple expanded rosters
- **WHEN** the user expands multiple roster sections
- **THEN** all expanded sections SHALL remain open simultaneously

### Requirement: Inline character CRUD
The system SHALL allow adding, editing, and deleting characters directly from the expanded roster section on `/rosters`, without navigating to a detail page.

#### Scenario: Add character inline
- **WHEN** the user fills in the add-character form (name, class, item level) inside an expanded roster section and submits
- **THEN** the character SHALL be created via `POST /api/rosters/{rosterId}/characters`
- **AND** the roster list SHALL refresh to show the new character

#### Scenario: Edit character inline
- **WHEN** the user clicks the edit button on a character row inside an expanded roster section
- **THEN** the row SHALL transform into inline edit fields (name, class, item level)
- **AND** saving via `PUT /api/characters/{id}` SHALL update the character and refresh the list

#### Scenario: Delete character inline
- **WHEN** the user clicks the delete button on a character row
- **THEN** a confirm dialog SHALL appear
- **AND** on confirmation, the character SHALL be deleted via `DELETE /api/characters/{id}`
- **AND** the roster list SHALL refresh

### Requirement: Inline raid assignment
The system SHALL allow assigning raids to characters directly from the expanded roster section using the existing RaidCombobox component.

#### Scenario: Assign raids inline
- **WHEN** the user clicks the raid button on a character row inside an expanded section
- **THEN** the RaidCombobox SHALL open inline
- **AND** assigning/removing raids SHALL work identically to the detail page

### Requirement: Inline character reorder
The system SHALL allow reordering characters within an expanded roster section using drag handles.

#### Scenario: Single active reorder
- **WHEN** the user enables reorder mode for one roster section
- **THEN** any previously active reorder mode on another roster SHALL be disabled
- **AND** only one roster SHALL be in reorder mode at a time

#### Scenario: Save and Discard inline with reorder button
- **WHEN** reorder mode is active for a roster section
- **THEN** Save and Discard buttons SHALL appear next to the "Cancel Reorder" button
- **AND** the Save button SHALL be disabled until a drag occurs (dirty)
- **AND** clicking Save SHALL persist the order via `PUT /api/characters/reorder`
- **AND** clicking Discard SHALL reset the order to the original query data

#### Scenario: Discard resets sort state
- **WHEN** the user clicks Discard or activates reorder on another roster
- **THEN** the working order ref SHALL be cleared
- **AND** the SortableList component SHALL remount to discard its internal `orderedItems` state
- **AND** the next reorder activation SHALL start from the original query data

### Requirement: Compact character row
The system SHALL display character rows in a compact single-line layout.

#### Scenario: Character row layout
- **WHEN** a character row is rendered
- **THEN** the row SHALL show name, class badge, item level, and assigned raid badges on a single line
- **AND** the Raids button SHALL sit inline next to the raid badges
- **AND** the edit and delete buttons SHALL be pushed to the right edge

### Requirement: RaidCombobox click-outside behavior
The system SHALL fully close the RaidCombobox when the user clicks outside it.

#### Scenario: Click outside closes RaidCombobox
- **WHEN** the RaidCombobox is open and the user clicks outside the trigger or popover
- **THEN** the `onClose` callback SHALL be called
- **AND** the character row SHALL return to showing the normal Raids button

#### Scenario: Escape closes RaidCombobox
- **WHEN** the RaidCombobox popover is open and the user presses Escape
- **THEN** the `onClose` callback SHALL be called

### Requirement: Query invalidation covers list page
The system SHALL invalidate the correct query key when raids are saved.

#### Scenario: List page refreshes after raid save
- **WHEN** the user saves raid changes via the RaidCombobox on the `/rosters` page
- **THEN** `queryClient.invalidateQueries({ queryKey: ["/api/rosters"] })` SHALL be called
- **AND** the character list SHALL reflect the updated raids

### Requirement: Inline AGS character import
The system SHALL allow importing characters from AGS API for linked rosters directly from the expanded section.

#### Scenario: Import characters inline
- **WHEN** the user clicks "Import Characters" inside an expanded roster section that has `rosterGuid` set
- **THEN** the AddRosterCharactersModal SHALL open
- **AND** the roster list SHALL refresh after import completes
