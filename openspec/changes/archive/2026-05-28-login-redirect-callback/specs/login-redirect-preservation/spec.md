## ADDED Requirements

### Requirement: AuthGuard preserves original URL
The system SHALL redirect unauthenticated users to `/auth/signin?callbackUrl=<current_path>` preserving the full path and query string.

#### Scenario: Unauthenticated user visits protected route
- **WHEN** an unauthenticated user visits `/groups/join?code=abc`
- **THEN** the system redirects to `/auth/signin?callbackUrl=%2Fgroups%2Fjoin%3Fcode%3Dabc`

#### Scenario: Authenticated user visits protected route
- **WHEN** an authenticated user visits `/dashboard`
- **THEN** the system renders the page normally without redirect

#### Scenario: Unauthenticated user visits protected route without query
- **WHEN** an unauthenticated user visits `/groups`
- **THEN** the system redirects to `/auth/signin?callbackUrl=%2Fgroups`

### Requirement: Sign-in page uses callbackUrl
The sign-in page SHALL read `callbackUrl` from query params and pass it to the `signIn()` call.

#### Scenario: callbackUrl present in search params
- **WHEN** a user visits `/auth/signin?callbackUrl=%2Fgroups%2Fjoin%3Fcode%3Dabc` and signs in
- **THEN** after OAuth completes, the browser redirects to `/groups/join?code=abc`

#### Scenario: No callbackUrl in search params
- **WHEN** a user visits `/auth/signin` (no callbackUrl) and signs in
- **THEN** after OAuth completes, the browser redirects to `/dashboard`

#### Scenario: Invalid callbackUrl (external domain)
- **WHEN** a user visits `/auth/signin?callbackUrl=https%3A%2F%2Fevil.com`
- **THEN** the system falls back to `/dashboard` to prevent open redirect
