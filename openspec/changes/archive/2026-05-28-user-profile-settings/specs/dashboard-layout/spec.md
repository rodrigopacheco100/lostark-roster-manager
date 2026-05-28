## MODIFIED Requirements

### Requirement: OwnerSection SHALL display user avatar

The OwnerSection component SHALL render the user's avatar image next to the owner name when an `image` URL is available.

#### Scenario: Owner has image
- **WHEN** the OwnerSection renders for an owner with a non-null `image` field
- **THEN** a small circular avatar SHALL appear to the left of the owner name

#### Scenario: Owner has no image
- **WHEN** the OwnerSection renders for an owner with a null or empty `image` field
- **THEN** no avatar SHALL be displayed (owner name only)

#### Scenario: Image fails to load
- **WHEN** the owner's image URL fails to load
- **THEN** the avatar SHALL be hidden gracefully (no broken image icon displayed)
