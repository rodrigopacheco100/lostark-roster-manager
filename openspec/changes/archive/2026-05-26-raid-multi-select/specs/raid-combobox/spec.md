## ADDED Requirements

### Requirement: PUT endpoint syncs raid assignments
The system SHALL accept a PUT request with the desired set of raid difficulty IDs for a character, compute the diff against current assignments, and apply both adds and removals atomically.

#### Scenario: Add and remove in one request
- **WHEN** a character has raids [rd1, rd3] and a PUT request is sent with `{ "raidDifficultyIds": ["rd1", "rd2"] }`
- **THEN** the server inserts rd2 and removes rd3 in a single transaction
- **THEN** the server returns 200 with `{ "added": 1, "removed": 1 }`

#### Scenario: No changes requested
- **WHEN** a character has raids [rd1, rd2] and a PUT request is sent with the same IDs
- **THEN** the server returns 200 with `{ "added": 0, "removed": 0 }` and no DB changes occur

### Requirement: PUT endpoint enforces max 3
The PUT endpoint SHALL reject any request where the desired set exceeds 3 raid difficulty IDs.

#### Scenario: Desired set exceeds max
- **WHEN** a PUT request is sent with 4 raid difficulty IDs
- **THEN** the server returns 400 with an error message and makes no DB changes

#### Scenario: Remove down to empty
- **WHEN** a character has 2 raids and a PUT request is sent with an empty array
- **THEN** the server removes both raids and returns 200 with `{ "added": 0, "removed": 2 }`

### Requirement: PUT endpoint enforces one difficulty per raid
The PUT endpoint SHALL reject any request where the desired set contains two difficulties belonging to the same raid group.

#### Scenario: Two difficulties of same raid in request
- **WHEN** a PUT request includes both "Normal" and "Hard" of "Act 1 - Aegir"
- **THEN** the server returns 409 with an error indicating duplicate raid group and makes no DB changes

#### Scenario: Changing difficulty of an existing raid (replacement)
- **WHEN** a character has "Normal" of "Act 1 - Aegir" and a PUT request is sent with only "Hard" of "Act 1 - Aegir"
- **THEN** the server accepts the request (the old Normal is removed, Hard is added in one transaction)
- **THEN** the server returns 200 with `{ "added": 1, "removed": 1 }`

#### Scenario: Same raid, one kept one added across desired set
- **WHEN** a character has "Normal" of "Act 1 - Aegir" and a PUT request is sent with "Normal" and "Hard" of "Act 1 - Aegir"
- **THEN** the server returns 409 because the desired set itself contains two difficulties of the same raid

### Requirement: PUT endpoint enforces item level
The PUT endpoint SHALL reject any request where a desired difficulty's minimum item level exceeds the character's item level.

#### Scenario: Difficulty above character ilvl
- **WHEN** a character with item level 1600 receives a PUT request that includes a difficulty with minIlvl 1620
- **THEN** the server returns 400 with an error and makes no DB changes

### Requirement: Combobox with search and checkboxes
The system SHALL present a combobox popover with search input and checkboxes when the user clicks "Edit Raids" on a character card.

#### Scenario: Open combobox
- **WHEN** user clicks "Edit Raids" on a character card
- **THEN** a popover opens below the trigger showing a search input and a list of all eligible raid difficulties grouped by raid name

#### Scenario: Search filters options
- **WHEN** the combobox is open and the user types "Aegir" in the search input
- **THEN** only items matching "Aegir" (raid name or difficulty name) are shown

#### Scenario: Only ilvl-eligible difficulties shown
- **WHEN** the combobox opens for a character with item level 1610
- **THEN** only difficulties with minIlvl ≤ 1610 are shown

#### Scenario: Already-assigned raids are pre-checked
- **WHEN** the combobox opens for a character that has "Hard" of "Act 1 - Aegir" and "Normal" of "Act 2 - Behemoth"
- **THEN** those two checkboxes are rendered as checked
- **THEN** the combobox trigger shows those two raids as chips

### Requirement: UI enforces max 3 selections
The combobox SHALL prevent the user from checking more than 3 checkboxes total.

#### Scenario: Block 4th selection
- **WHEN** 3 checkboxes are already checked and the user clicks a 4th unassigned difficulty
- **THEN** the checkbox does not become checked
- **THEN** a visual indicator shows "Maximum of 3 raids reached"

#### Scenario: Free a slot by unchecking
- **WHEN** 3 checkboxes are checked and the user unchecks one
- **THEN** the counter updates to show 2/3 and previously disabled checkboxes become available again

### Requirement: UI prevents duplicate raid groups
The combobox SHALL prevent the user from selecting two difficulties of the same raid.

#### Scenario: Block same-raid selection
- **WHEN** the user has "Normal" of "Act 1 - Aegir" checked and clicks "Hard" of the same raid
- **THEN** the "Hard" checkbox does not become checked
- **THEN** an explanatory message is shown (tooltip or inline)

#### Scenario: Changing difficulty of a raid
- **WHEN** the user has "Normal" of "Act 1 - Aegir" checked, unchecks it, then checks "Hard" of the same raid
- **THEN** only "Hard" remains checked

### Requirement: Save button syncs via PUT
The combobox SHALL have a Save button that sends the current checked set to the PUT endpoint.

#### Scenario: Save with changes
- **WHEN** the user checks 2 new difficulties (unchecking none) and clicks "Save"
- **THEN** a PUT request is sent with the full checked set
- **THEN** on success, the popover closes, a success toast is shown, and the character's raid list refreshes

#### Scenario: Save with no changes
- **WHEN** the user opens the combobox and clicks "Save" without changing any checkboxes
- **THEN** a PUT request is still sent (server returns 0/0)
- **THEN** the popover closes

#### Scenario: Save on error
- **WHEN** the user makes selections, clicks "Save", and the server returns an error
- **THEN** an error toast is shown
- **THEN** the popover stays open so the user can adjust and retry

### Requirement: Chip X removal triggers immediate PUT
The combobox trigger SHALL show selected raids as chips with an X button that immediately removes the raid via PUT.

#### Scenario: Remove via chip X
- **WHEN** the user clicks the X on a chip inside the combobox trigger
- **THEN** a PUT request is sent with that raid ID removed from the set
- **THEN** on success, the chip disappears and the character's raids update
- **THEN** the combobox open state is preserved (if open, the checkbox also updates)
