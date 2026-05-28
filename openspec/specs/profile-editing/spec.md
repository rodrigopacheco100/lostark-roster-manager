## ADDED Requirements

### Requirement: User SHALL edit display name
The profile page SHALL provide an editable text field for the user's display name.

#### Scenario: User changes display name
- **WHEN** the user types a new name in the display name field and clicks Save
- **THEN** the system SHALL update the user's name via `PUT /api/user/me` and show a success toast

#### Scenario: User clears display name
- **WHEN** the user submits an empty display name
- **THEN** the system SHALL reject the update and show a validation error

### Requirement: User SHALL edit avatar URL with preview
The profile page SHALL provide a text input for an image URL and show a live preview of the image.

#### Scenario: User enters valid image URL
- **WHEN** the user types a URL into the avatar input
- **THEN** the system SHALL display a live preview of the image below the input

#### Scenario: User enters invalid URL
- **WHEN** the user types a non-URL string or the image fails to load
- **THEN** the system SHALL show a fallback placeholder instead of the broken image

#### Scenario: User saves new avatar
- **WHEN** the user clicks Save after entering a valid avatar URL
- **THEN** the system SHALL update the user's image via `PUT /api/user/me` and show a success toast

### Requirement: PUT /api/user/me endpoint
The system SHALL provide a `PUT /api/user/me` endpoint that accepts `{ name?: string, image?: string }` and updates the current user.

#### Scenario: Authenticated user updates profile
- **WHEN** an authenticated user sends a PUT request with `name` and/or `image`
- **THEN** the system SHALL update the user record in the database and return the updated user

#### Scenario: Unauthenticated request
- **WHEN** an unauthenticated request is sent to PUT /api/user/me
- **THEN** the system SHALL return 401

### Requirement: Auth signIn SHALL NOT overwrite editable fields
The `signIn` callback SHALL only set the provider ID when a user already exists — it SHALL NOT update `name`, `email`, or `image`.

#### Scenario: Existing user signs in again
- **WHEN** an existing user signs in with any OAuth provider
- **THEN** the system SHALL only link the provider ID to the existing account
- **THEN** the user's `name` and `image` SHALL remain unchanged

#### Scenario: New user signs in for first time
- **WHEN** a new user signs in for the first time
- **THEN** the system SHALL create the user with `name`, `email`, `image`, `friendCode`, and the provider ID from the OAuth response

### Requirement: Friend code SHALL NOT appear on profile page
The profile page SHALL NOT display the friend code section.

#### Scenario: User visits profile page
- **WHEN** a user navigates to `/profile`
- **THEN** the friend code SHALL NOT be shown anywhere on the page
