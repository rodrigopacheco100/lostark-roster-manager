## ADDED Requirements

### Requirement: Dashboard container SHALL prevent body scroll
The dashboard layout container SHALL use `h-screen overflow-hidden` to prevent the entire page from scrolling.

#### Scenario: User navigates to dashboard
- **WHEN** a user visits any dashboard page
- **THEN** the page body SHALL NOT scroll (scroll is limited to the content area)

### Requirement: Sidebar SHALL be fixed and full height
The sidebar SHALL use `h-screen` (or equivalent) to fill the viewport height and remain fixed while the content area scrolls.

#### Scenario: User scrolls content area
- **WHEN** a user scrolls the main content area
- **THEN** the sidebar SHALL remain in place and not scroll

### Requirement: Main content area SHALL scroll independently
The `<main>` content area SHALL use `overflow-y-auto` to enable scrolling for content that exceeds the viewport height.

#### Scenario: Content exceeds viewport height
- **WHEN** the main content is taller than the viewport
- **THEN** the content area SHALL show a scrollbar and allow vertical scrolling

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
