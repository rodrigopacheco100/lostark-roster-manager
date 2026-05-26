## ADDED Requirements

### Requirement: Sidebar donate button
The system SHALL display a "Buy me a coffee" link in the sidebar that opens the project's Buy Me a Coffee page in a new tab.

#### Scenario: Donate link is visible
- **WHEN** the sidebar is rendered
- **THEN** a link with "Buy me a coffee" text and a coffee cup icon SHALL appear above the sign-out button

#### Scenario: Donate link opens in new tab
- **WHEN** the user clicks the donate link
- **THEN** a new browser tab SHALL open to https://buymeacoffee.com/axiosz
