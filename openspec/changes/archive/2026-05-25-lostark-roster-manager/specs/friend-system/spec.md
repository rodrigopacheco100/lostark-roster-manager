## ADDED Requirements

### Requirement: User can send a friend request
The system SHALL allow an authenticated user to send a friend request to another user by their email or display name.

#### Scenario: Send friend request
- **WHEN** user searches for another user and clicks "Add Friend"
- **THEN** a pending friend request is created

#### Scenario: Cannot friend self
- **WHEN** user tries to send a friend request to themselves
- **THEN** the system rejects the request with an appropriate message

### Requirement: User can accept or decline a friend request
The system SHALL allow a user to accept or decline incoming friend requests.

#### Scenario: Accept friend request
- **WHEN** user clicks "Accept" on a pending friend request
- **THEN** the friendship is established and both users appear in each other's friend lists

#### Scenario: Decline friend request
- **WHEN** user clicks "Decline" on a pending friend request
- **THEN** the request is rejected and removed

### Requirement: User can view their friend list
The system SHALL display the authenticated user's current friends.

#### Scenario: View friend list
- **WHEN** user navigates to the friends page
- **THEN** a list of accepted friends is displayed with their names and avatars

### Requirement: User can remove a friend
The system SHALL allow a user to remove an existing friend.

#### Scenario: Remove friend
- **WHEN** user clicks "Remove Friend" on a friend's profile
- **THEN** the friendship is removed from both users' friend lists

### Requirement: User can see pending friend requests
The system SHALL show a user their pending sent and received friend requests.

#### Scenario: View pending requests
- **WHEN** user navigates to the friend requests section
- **THEN** sent and received pending requests are displayed
