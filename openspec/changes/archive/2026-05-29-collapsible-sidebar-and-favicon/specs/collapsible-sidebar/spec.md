## ADDED Requirements

### Requirement: Sidebar toggles between expanded and collapsed states
The sidebar SHALL have two states: expanded (showing labels + icons, width 256px) and collapsed (showing only icons, width 64px). The user SHALL be able to toggle between states via a button at the top right of the sidebar.

#### Scenario: Toggle from expanded to collapsed
- **WHEN** the user clicks the toggle button in the expanded sidebar
- **THEN** the sidebar animates smoothly to collapsed width (w-16), all text labels are hidden, and only icons remain visible

#### Scenario: Toggle from collapsed to expanded
- **WHEN** the user clicks the toggle button in the collapsed sidebar
- **THEN** the sidebar animates smoothly to expanded width (w-64), and all text labels reappear

#### Scenario: Toggle button icon reflects current state
- **WHEN** the sidebar is expanded
- **THEN** the toggle button shows a collapse icon (PanelLeftClose)
- **WHEN** the sidebar is collapsed
- **THEN** the toggle button shows an expand icon (PanelLeftOpen)

### Requirement: Collapsed state shows tooltips on hover
When the sidebar is collapsed, each navigation item SHALL display a tooltip with the link/button label on hover. Tooltips SHALL appear to the right of the icon.

#### Scenario: Tooltip appears on hover over a nav link
- **WHEN** the sidebar is collapsed and the user hovers over a nav link icon
- **THEN** a tooltip with the link's label text appears to the right of the icon

#### Scenario: Tooltip disappears when hover ends
- **WHEN** the sidebar is collapsed and the user stops hovering over a nav link icon
- **THEN** the tooltip disappears

#### Scenario: No tooltip when expanded
- **WHEN** the sidebar is expanded
- **THEN** no tooltips are shown on nav links

### Requirement: Collapsed state persists across sessions
The collapsed state SHALL be persisted in localStorage so the user's preference is remembered across page reloads and browser sessions.

#### Scenario: State persists after page reload
- **WHEN** the user collapses the sidebar and reloads the page
- **THEN** the sidebar loads in collapsed state

#### Scenario: Initial load uses localStorage value
- **WHEN** the user visits the dashboard for the first time (no stored preference)
- **THEN** the sidebar loads in expanded state as default

### Requirement: Same icon spacing in both modes
The gap/spacing between icons and their surrounding padding SHALL remain identical between expanded and collapsed modes to ensure a smooth visual transition.

#### Scenario: Icon positioning is consistent
- **WHEN** transitioning between expanded and collapsed states
- **THEN** the icon elements do not shift position; only the label text fades in/out

### Requirement: All sidebar items respect collapsed state
The sidebar SHALL hide text labels and group labels when collapsed, applying equally to all nav groups, the "Buy me a coffee" link, and the "Sign out" button.

#### Scenario: Group labels hidden when collapsed
- **WHEN** the sidebar is collapsed
- **THEN** group section headers (e.g., "Roster Management", "Social") are hidden

#### Scenario: Buy me a coffee label hidden when collapsed
- **WHEN** the sidebar is collapsed
- **THEN** the "Buy me a coffee" text is hidden, and only the Coffee icon and ExternalLink icon remain visible

#### Scenario: Sign out label hidden when collapsed
- **WHEN** the sidebar is collapsed
- **THEN** the "Sign out" text is hidden, and only the LogOut icon remains visible
