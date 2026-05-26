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
