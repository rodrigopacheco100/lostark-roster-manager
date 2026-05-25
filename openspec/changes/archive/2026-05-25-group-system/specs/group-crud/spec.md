## ADDED Requirements

### Requirement: User can create a group
The system SHALL allow any authenticated user to create a group. Upon creation, the system SHALL generate a unique 8-character hex invite code and set the creator as the group owner.

#### Scenario: Create group successfully
- **WHEN** an authenticated user POSTs to `/api/groups` with `{ name: "My Group" }`
- **THEN** the system creates the group, generates an invite code, sets the user as owner, and returns the group object with status 201

### Requirement: User can list their groups
The system SHALL return all groups the authenticated user is a member of, with member count and the user's role in each.

#### Scenario: List groups
- **WHEN** an authenticated user GETs `/api/groups`
- **THEN** the system returns an array of groups with `{ id, name, inviteCode, memberCount, role }`

### Requirement: User can view group details
The system SHALL return full group details including all members with their roles, invite code, and ban list for members who can view them.

#### Scenario: View group details as member
- **WHEN** a group member GETs `/api/groups/[id]`
- **THEN** the system returns the group with members array `[{ id, name, image, role }]` and the invite code

### Requirement: Owner can delete group
The system SHALL allow the group owner to delete the group, which removes all memberships and bans.

#### Scenario: Owner deletes group
- **WHEN** the group owner sends DELETE to `/api/groups/[id]`
- **THEN** the system deletes the group, all member rows, and all ban rows, returning status 200

#### Scenario: Non-owner tries to delete
- **WHEN** a non-owner member sends DELETE to `/api/groups/[id]`
- **THEN** the system returns 403 Forbidden

### Requirement: Owner can transfer group ownership
The system SHALL allow the owner to transfer ownership to another group member. The current owner becomes a member, and the target member becomes owner.

#### Scenario: Transfer ownership
- **WHEN** the owner POSTs to `/api/groups/[id]/transfer` with `{ targetUserId: "..." }`
- **THEN** the system updates roles: target becomes owner, current owner becomes member, returns 200

#### Scenario: Non-owner tries to transfer
- **WHEN** a non-owner POSTs to transfer
- **THEN** the system returns 403 Forbidden

### Requirement: Owner can rename group
The system SHALL allow the owner to update the group name.

#### Scenario: Rename group
- **WHEN** the owner PUTs to `/api/groups/[id]` with `{ name: "New Name" }`
- **THEN** the system updates the group name and returns the updated group

### Requirement: Owner can change member roles
The system SHALL allow the owner to promote a member to admin or demote an admin to member. The owner cannot change their own role this way (use transfer).

#### Scenario: Promote member to admin
- **WHEN** the owner PUTs to `/api/groups/[id]/members/[userId]/role` with `{ role: "admin" }`
- **THEN** the system updates the member's role to admin and returns 200

#### Scenario: Demote admin to member
- **WHEN** the owner PUTs the same endpoint with `{ role: "member" }` on an admin
- **THEN** the system updates the role to member and returns 200

#### Scenario: Non-owner tries to change roles
- **WHEN** a non-owner PUTs to change a role
- **THEN** the system returns 403 Forbidden
