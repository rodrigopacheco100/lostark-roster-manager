## MODIFIED Requirements

### Requirement: Dashboard API response SHALL include owner image

The `GET /api/dashboard` response SHALL include an optional `image` field in each `owner` object.

#### Scenario: Dashboard API returns owners with images
- **WHEN** the dashboard API fetches owners (self, friends, group members)
- **THEN** each `owner` object SHALL include an `image` field with the user's avatar URL (or null)

### Requirement: OwnerInfo type SHALL include image field

The `OwnerInfo` TypeScript type SHALL include an optional `image: string | null` field.

#### Scenario: OwnerInfo is constructed
- **WHEN** OwnerInfo is created in the dashboard API
- **THEN** the `image` field SHALL be populated from `user.image`
