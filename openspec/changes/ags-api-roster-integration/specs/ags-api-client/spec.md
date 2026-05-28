## ADDED Requirements

### Requirement: AGS API client shall provide character lookup by name and region
The system SHALL expose a function `getCharacterByName(region: string, name: string)` that calls `https://api.ags.lol/api/v1/mirth/characters/by-name/{region}/{name}` with the `x-api-key` header and returns the typed response.

#### Scenario: Successful character lookup
- **WHEN** `getCharacterByName("NA", "Mërthiolate")` is called
- **THEN** it returns an object with `guid`, `roster_guid`, `name`, `region`, `world`, `class`, `item_level`, `combat_power`, `max_combat_power`, `last_update_timestamp`

#### Scenario: Character not found
- **WHEN** `getCharacterByName` is called with a non-existent character name
- **THEN** it throws an error with the API's error message

#### Scenario: API returns non-2xx status
- **WHEN** the ags.lol API returns an error status
- **THEN** it throws an error with the status text or response error message

### Requirement: AGS API client shall provide roster lookup by GUID
The system SHALL expose a function `getRosterByGuid(guid: string)` that calls `https://api.ags.lol/api/v1/mirth/rosters/by-guid/{guid}` with the `x-api-key` header and returns the typed response with all characters.

#### Scenario: Successful roster lookup
- **WHEN** `getRosterByGuid("e373c8b7-...")` is called with a valid GUID
- **THEN** it returns an object with `guid`, `region`, `world`, and `characters` array

#### Scenario: Roster not found
- **WHEN** `getRosterByGuid` is called with an invalid GUID
- **THEN** it throws an error with the API's error message

### Requirement: AGS API client shall read API key from env
The system SHALL read `AGS_API_KEY` from environment variables and include it as the `x-api-key` header on all requests.

#### Scenario: API key present
- **WHEN** the client makes a request
- **THEN** the `x-api-key` header is set to the value of `AGS_API_KEY`

#### Scenario: API key missing
- **WHEN** `AGS_API_KEY` is not set
- **THEN** the client throws a descriptive error at first use

### Requirement: AGS API client shall define TypeScript types for responses
The system SHALL define interfaces `AGSCharacter` and `AGSRoster` matching the API response shapes.

#### Scenario: Types defined
- **WHEN** importing from the client module
- **THEN** `AGSCharacter` and `AGSRoster` types are available with all response fields
