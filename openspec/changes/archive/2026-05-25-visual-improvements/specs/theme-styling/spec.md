## ADDED Requirements

### Requirement: Custom Tailwind theme with design tokens
The system SHALL define a custom Tailwind theme with extended colors including background surfaces (#181818, #1e1e1e, #252525, #2a2a2a).

#### Scenario: Dark background tokens available
- **WHEN** a component uses `bg-surface` or `bg-surface-elevated`
- **THEN** it renders with the corresponding dark surface color

### Requirement: Dark mode via class strategy
The system SHALL use `darkMode: "class"` in Tailwind config with `<html class="dark">` set by default.

#### Scenario: Dark class on html element
- **WHEN** the page loads
- **THEN** `<html>` element has a `dark` class, and all dark-mode Tailwind variants apply

#### Scenario: No flash of unstyled light content
- **WHEN** the page first paints
- **THEN** the dark class is applied before any content renders (inline script in `<head>`)

### Requirement: Background color #181818
The system SHALL use #181818 as the default dark background color for all page-level surfaces.

#### Scenario: Page background in dark mode
- **WHEN** a user navigates any authenticated page
- **THEN** the background color is #181818

### Requirement: Sidebar with icons and section headers
The system SHALL display sidebar navigation with Lucide icons, section headers, and the logout action at the bottom.

#### Scenario: Sidebar renders with sections
- **WHEN** the dashboard layout renders
- **THEN** the sidebar shows a "Roster Management" section (Dashboard, Rosters, Raids) and a "Social" section (Friends, Profile), each with appropriate icons

### Requirement: Sidebar active navigation state
The system SHALL highlight the currently active navigation link in the sidebar.

#### Scenario: Active link highlighted
- **WHEN** a user is on the /dashboard page
- **THEN** the "Dashboard" link in the sidebar has a distinct visual style (brighter text and background indicator)

### Requirement: Subtle transitions for interactive elements
The system SHALL apply subtle CSS transitions (hover, focus, enter) to interactive elements for a modern feel.

#### Scenario: Button hover transition
- **WHEN** a user hovers over a Button
- **THEN** there is a smooth color/brightness transition (200-300ms ease)

#### Scenario: Card hover effect
- **WHEN** a user hovers over a clickable Card
- **THEN** the card slightly brightens with a smooth transition

### Requirement: Visual hierarchy with elevated surfaces
The system SHALL use stepped surface tones (#1e1e1e for cards, #252525 for nested elements, #2a2a2a for hover states) to create depth.

#### Scenario: Card with elevated surface
- **WHEN** a Card component renders
- **THEN** its background is #1e1e1e, darker than the page background #181818

#### Scenario: Nested surface
- **WHEN** an element is nested inside a Card (e.g., a list item)
- **THEN** its background is #252525 for visual separation
