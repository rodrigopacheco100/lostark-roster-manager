## ADDED Requirements

### Requirement: Favicon image is placed correctly
The `favicon.png` file SHALL be placed in the Next.js App Router `src/app/` directory so it is automatically served as the site favicon.

#### Scenario: Favicon served at root
- **WHEN** a browser requests `/favicon.png`
- **THEN** the server responds with the correct PNG favicon image

### Requirement: Favicon is registered in metadata
The root layout metadata SHALL explicitly reference the favicon to ensure all browsers detect it correctly.

#### Scenario: Metadata includes favicon
- **WHEN** the root layout metadata is examined
- **THEN** it SHALL include an `icons` property pointing to the favicon
