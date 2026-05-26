## ADDED Requirements

### Requirement: ConfirmDialog is promise-based
The system SHALL provide a `useConfirm` hook that returns a `confirm` function. Calling `confirm(options)` SHALL return a Promise<boolean> that resolves to `true` if the user confirmed or `false` if cancelled.

#### Scenario: User confirms action
- **WHEN** user calls `const ok = await confirm({ title: "Delete?", message: "Are you sure?" })` and clicks "Confirm"
- **THEN** the promise resolves to `true`

#### Scenario: User cancels action
- **WHEN** user calls `await confirm(...)` and clicks "Cancel" or the overlay
- **THEN** the promise resolves to `false`

### Requirement: ConfirmDialog accepts title, message, and button labels
The `confirm` function SHALL accept an options object with `title`, `message`, `confirmLabel`, and `cancelLabel`.

#### Scenario: Custom button labels
- **WHEN** user calls `confirm({ title: "Leave", message: "Really?", confirmLabel: "Sair", cancelLabel: "Voltar" })`
- **THEN** the dialog shows "Sair" and "Voltar" as button labels

### Requirement: ConfirmDialog supports destructive actions
The system SHALL support a `destructive` option that styles the confirm button in red for dangerous actions.

#### Scenario: Destructive confirm is styled red
- **WHEN** user calls `confirm({ title: "Delete", message: "Irreversible", destructive: true })`
- **THEN** the confirm button is styled with red/danger colors

### Requirement: ConfirmDialog replaces all native confirm() calls
All 9 existing `confirm()` calls across 5 page files SHALL be replaced with the promise-based `useConfirm()` hook.

#### Scenario: Friends page uses ConfirmDialog
- **WHEN** user clicks "Remove" on a friend
- **THEN** a styled ConfirmDialog appears instead of native confirm()

#### Scenario: Groups page uses ConfirmDialog
- **WHEN** user clicks "Sair", "Excluir Grupo", transfers ownership, kicks, or bans
- **THEN** styled ConfirmDialogs appear instead of native confirm()

#### Scenario: Rosters and Raids pages use ConfirmDialog
- **WHEN** user deletes a roster, character, or raid
- **THEN** styled ConfirmDialogs appear instead of native confirm()

### Requirement: Alert calls replaced with toast
The single `alert()` call in the groups detail page SHALL be replaced with a toast notification of type "error".

#### Scenario: Action failure shows toast
- **WHEN** a group action fails
- **THEN** an error toast appears with the error message instead of an alert box
