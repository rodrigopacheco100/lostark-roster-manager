## ADDED Requirements

### Requirement: All user-facing text SHALL be in English
Every string visible to the user (UI labels, button text, toast messages, confirm dialog text, error messages) SHALL be in English.

#### Scenario: User views any page
- **WHEN** a user opens any page in the app
- **THEN** all visible text SHALL be in English (not Portuguese)

### Requirement: API error responses SHALL use English messages
All API route error responses SHALL return error messages in English.

#### Scenario: API returns an error
- **WHEN** an API route returns a non-2xx response
- **THEN** the `error` field in the response body SHALL be in English

### Requirement: Confirm dialog defaults SHALL use English labels
The default confirm and cancel button labels in `useConfirm` SHALL be "Confirm" and "Cancel" respectively.

#### Scenario: Confirm dialog appears
- **WHEN** a confirm dialog is shown to the user
- **THEN** the confirm button SHALL display "Confirm" and the cancel button SHALL display "Cancel"
