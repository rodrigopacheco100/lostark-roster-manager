## ADDED Requirements

### Requirement: Reusable Button component
The system SHALL provide a reusable Button component with variant (primary, secondary, danger, ghost) and size (sm, md, lg) props.

#### Scenario: Render primary button
- **WHEN** a Button is rendered with `variant="primary"`
- **THEN** it displays with the primary accent color (blue) and proper hover/active states

#### Scenario: Render danger button
- **WHEN** a Button is rendered with `variant="danger"`
- **THEN** it displays with red accent color

#### Scenario: Render ghost button
- **WHEN** a Button is rendered with `variant="ghost"`
- **THEN** it displays with no background, only text

#### Scenario: Button with icon
- **WHEN** a Button is rendered with an `icon` prop (Lucide icon component)
- **THEN** the icon is displayed before the button text

### Requirement: Reusable Input component
The system SHALL provide a reusable Input component with label, error message, and placeholder support.

#### Scenario: Render with label
- **WHEN** an Input is rendered with a `label` prop
- **THEN** the label text is displayed above the input field

#### Scenario: Render with error
- **WHEN** an Input is rendered with an `error` prop
- **THEN** the error message is displayed below the input in red

### Requirement: Reusable Card component
The system SHALL provide a reusable Card component with consistent padding, border, and background (#1e1e1e).

#### Scenario: Render default card
- **WHEN** a Card is rendered with children
- **THEN** it displays as a rounded box with dark surface background and padding

### Requirement: Reusable Badge component
The system SHALL provide a reusable Badge component with color variant prop (blue, green, red, gray, yellow).

#### Scenario: Render badge with color
- **WHEN** a Badge is rendered with `color="blue"`
- **THEN** it displays a small pill with blue background and white text

### Requirement: Reusable Modal component
The system SHALL provide a reusable Modal component with overlay, title, and close on Escape key.

#### Scenario: Open modal
- **WHEN** a Modal is rendered with `isOpen={true}`
- **THEN** it displays centered on screen with a dark overlay behind it

#### Scenario: Close on Escape
- **WHEN** the Modal is open and user presses Escape
- **THEN** the modal closes

### Requirement: Reusable Select component
The system SHALL provide a reusable Select component with label, options array, and error support.

#### Scenario: Render select with options
- **WHEN** a Select is rendered with an array of options
- **THEN** each option renders as a dropdown item

### Requirement: Reusable Skeleton component
The system SHALL provide a reusable Skeleton component for loading states with width, height, and rounded props.

#### Scenario: Render skeleton placeholder
- **WHEN** a Skeleton is rendered with width and height
- **THEN** it displays an animated placeholder

### Requirement: Reusable EmptyState component
The system SHALL provide an EmptyState component with icon, title, description, and optional action button for pages with no data.

#### Scenario: Render empty state with action
- **WHEN** an EmptyState is rendered with icon, title, description, and action
- **THEN** it displays centered with the icon above, title, description text, and action button below

### Requirement: Reusable PageHeader component
The system SHALL provide a PageHeader component with title and optional action slot for consistent page top layout.

#### Scenario: Render page header with action
- **WHEN** a PageHeader is rendered with a title and a button as action
- **THEN** the title is on the left and the action button is on the right
