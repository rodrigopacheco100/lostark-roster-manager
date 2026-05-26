## ADDED Requirements

### Requirement: Toast provider wraps the app
The system SHALL provide a `ToastProvider` component that wraps the application and manages toast state globally.

#### Scenario: ToastProvider renders without crashing
- **WHEN** the app renders with ToastProvider wrapping the children
- **THEN** no errors occur and children render normally

### Requirement: useToast hook returns a toast function
The system SHALL provide a `useToast` hook that returns a `toast` function accepting `(message: string, type: "success" | "error" | "info")`.

#### Scenario: Call toast with message and type
- **WHEN** a component calls `toast("Group created", "success")`
- **THEN** a toast notification appears with the message and appropriate styling

### Requirement: Toast auto-dismisses after 4 seconds
Each toast SHALL automatically disappear after 4 seconds unless manually closed.

#### Scenario: Toast disappears after timeout
- **WHEN** a toast appears
- **THEN** it is removed from the DOM after 4 seconds

### Requirement: Toasts stack with newest at bottom
Multiple toasts SHALL stack vertically with the newest appearing at the bottom of the stack, up to a maximum of 5 visible toasts.

#### Scenario: Multiple toasts stack
- **WHEN** 3 toasts are triggered in sequence
- **THEN** all 3 are visible, stacked from top to bottom in order of appearance

### Requirement: Toast has close button
Each toast SHALL have a close button that dismisses it immediately.

#### Scenario: Manual dismiss
- **WHEN** user clicks the close button on a toast
- **THEN** the toast is removed immediately

### Requirement: Toast types have distinct colors
The system SHALL use distinct colors for each toast type: success (green), error (red), info (blue), matching the app's design system.

#### Scenario: Success toast is styled green
- **WHEN** a success toast is shown
- **THEN** it has a green accent/border

#### Scenario: Error toast is styled red
- **WHEN** an error toast is shown
- **THEN** it has a red accent/border

#### Scenario: Info toast is styled blue
- **WHEN** an info toast is shown
- **THEN** it has a blue accent/border
