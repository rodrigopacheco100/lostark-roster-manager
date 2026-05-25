## ADDED Requirements

### Requirement: User can sign in with Google or Discord
The system SHALL allow users to authenticate using their Google or Discord account via OAuth 2.0.

#### Scenario: Successful sign in with Google
- **WHEN** user clicks "Sign in with Google"
- **THEN** user is redirected to Google consent screen
- **THEN** after consent, user is redirected back and authenticated

#### Scenario: Successful sign in with Discord
- **WHEN** user clicks "Sign in with Discord"
- **THEN** user is redirected to Discord authorization screen
- **THEN** after authorization, user is redirected back and authenticated

#### Scenario: First-time sign in creates account
- **WHEN** a new OAuth account authenticates (Google or Discord)
- **THEN** a user record is created with `googleId` or `discordId` set to the provider's ID

#### Scenario: Existing email links a new provider
- **WHEN** a user signs in with a different OAuth provider but the same email
- **THEN** the new provider ID is linked to the existing user record

### Requirement: Session is maintained
The system SHALL maintain an active session for authenticated users across page reloads.

#### Scenario: Authenticated user refreshes page
- **WHEN** an authenticated user refreshes the page
- **THEN** the session persists and user remains logged in

#### Scenario: Session expires
- **WHEN** the session token expires
- **THEN** the user is signed out and redirected to the login page

### Requirement: User can sign out
The system SHALL allow authenticated users to sign out.

#### Scenario: Successful sign out
- **WHEN** user clicks "Sign out"
- **THEN** the session is destroyed and user is redirected to the login page

### Requirement: User profile stores display name, avatar, and provider IDs
The system SHALL store the user's display name, avatar URL, and their Google/Discord ID.

#### Scenario: Profile populated on sign in
- **WHEN** a user signs in with Google or Discord
- **THEN** their name, avatar, and provider-specific ID are saved to their profile

### Requirement: Both provider IDs are nullable
The system SHALL allow `googleId` and `discordId` to be NULL so a user can have either, both, or one linked.

#### Scenario: User signs in with Google only
- **WHEN** a user signs in with Google
- **THEN** `google_id` is set and `discord_id` remains NULL

#### Scenario: User signs in with Discord only
- **WHEN** a user signs in with Discord
- **THEN** `discord_id` is set and `google_id` remains NULL

#### Scenario: User links a second provider
- **WHEN** a user signs in with the same email via a different provider
- **THEN** the respective provider ID column is updated and the other remains unchanged
