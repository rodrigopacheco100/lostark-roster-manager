## ADDED Requirements

### Requirement: Rate limit all API routes
All `/api/*` routes SHALL be rate-limited via the Next.js proxy file.

#### Scenario: Authenticated user under limit
- **WHEN** an authenticated user makes a request to `/api/dashboard`
- **THEN** the request passes through to the route handler

#### Scenario: Authenticated user over limit
- **WHEN** an authenticated user exceeds 100 requests per 60-second window
- **THEN** the server returns HTTP 429 with a `Retry-After` header

#### Scenario: Anonymous user under limit
- **WHEN** an unauthenticated request is made to `/api/auth/...`
- **THEN** the request passes through to the route handler

#### Scenario: Anonymous user over limit
- **WHEN** an anonymous IP exceeds 20 requests per 60-second window
- **THEN** the server returns HTTP 429

### Requirement: Rate limit state is in-memory
Rate limit counters SHALL be stored in an in-memory `Map` with sliding window cleanup.

#### Scenario: Old entries are pruned
- **WHEN** a rate limit check runs
- **THEN** timestamps older than the 60-second window are removed from the store

### Requirement: Error response is user-friendly
The 429 response SHALL include a JSON body with an error message.

#### Scenario: 429 response body
- **WHEN** a request is rate-limited
- **THEN** the response body is `{ "error": "Too many requests. Try again later." }`
