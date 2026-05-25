## ADDED Requirements

### Requirement: User can join group via invite code
The system SHALL allow any authenticated user to join a group by providing a valid invite code, provided they are not currently banned from that group.

#### Scenario: Join group successfully
- **WHEN** an authenticated user POSTs to `/api/groups/[id]/join` with `{ inviteCode: "abc12345" }`
- **THEN** the system adds the user as a member with role "member" and returns the group details with status 200

#### Scenario: Join with invalid invite code
- **WHEN** a user POSTs with an incorrect invite code
- **THEN** the system returns 400 Bad Request with error message

#### Scenario: Banned user tries to join
- **WHEN** a banned user attempts to join
- **THEN** the system returns 403 Forbidden with error "You are banned from this group"

#### Scenario: Already a member tries to join
- **WHEN** a current member POSTs to join
- **THEN** the system returns 409 Conflict with error "Already a member"

### Requirement: User can resolve invite code to group info
The system SHALL allow any authenticated user to look up a group by invite code to see its name and member count before joining.

#### Scenario: Resolve valid invite code
- **WHEN** a user GETs `/api/groups/join?code=abc12345`
- **THEN** the system returns `{ id, name, memberCount }` with status 200

### Requirement: Member can leave group
The system SHALL allow any member (except the owner) to leave the group, removing their membership.

#### Scenario: Member leaves group
- **WHEN** a member POSTs to `/api/groups/[id]/leave`
- **THEN** the system removes the membership and returns 200

#### Scenario: Owner tries to leave
- **WHEN** the owner POSTs to leave
- **THEN** the system returns 400 with error "Owner must transfer ownership before leaving"

### Requirement: Admin can kick a member
The system SHALL allow admins and the owner to remove a member from the group.

#### Scenario: Admin kicks member
- **WHEN** an admin/owner POSTs to `/api/groups/[id]/kick` with `{ userId: "..." }`
- **THEN** the system removes the member and returns 200

#### Scenario: Member tries to kick another member
- **WHEN** a regular member tries to kick
- **THEN** the system returns 403 Forbidden

#### Scenario: Admin tries to kick owner
- **WHEN** an admin tries to kick the owner
- **THEN** the system returns 400 with error "Cannot kick the group owner"

### Requirement: Admin can ban a user
The system SHALL allow admins and the owner to ban a user from the group, preventing them from joining via invite code. Banned users who are currently members are also removed.

#### Scenario: Admin bans user
- **WHEN** an admin/owner POSTs to `/api/groups/[id]/ban` with `{ userId: "..." }`
- **THEN** the system removes the user from members (if present), inserts a ban row with the current timestamp, and returns 200

#### Scenario: Member tries to ban
- **WHEN** a regular member tries to ban
- **THEN** the system returns 403 Forbidden

### Requirement: Admin can unban a user
The system SHALL allow admins and the owner to revoke a ban, allowing the user to join again.

#### Scenario: Admin unbans user
- **WHEN** an admin/owner POSTs to `/api/groups/[id]/unban` with `{ userId: "..." }`
- **THEN** the system removes the ban row and returns 200

### Requirement: Member can view participants
The system SHALL allow any group member to view the full list of participants with their roles.

#### Scenario: Member views participants
- **WHEN** a member views the group details page
- **THEN** the system returns all members with id, name, image, and role
