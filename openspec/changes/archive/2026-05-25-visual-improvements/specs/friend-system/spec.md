## ADDED Requirements

### Requirement: User has a unique friend code
The system SHALL generate a unique friend code for every user upon sign-up using `FC${Date.now()}`.

#### Scenario: Friend code generated on sign-up
- **WHEN** a new user signs in for the first time
- **THEN** their `friendCode` is set to `FC` followed by the current timestamp

#### Scenario: Friend code is unique
- **WHEN** two users sign up at different times
- **THEN** each has a different friend code (unique constraint in database)

### Requirement: User can view their friend code
The system SHALL display the current user's friend code on their profile page and in the Add Friend modal.

#### Scenario: Profile shows friend code
- **WHEN** user visits /profile
- **THEN** their friend code is displayed in a card with font-mono styling

#### Scenario: Add Friend modal shows own code
- **WHEN** user clicks "Add Friend" button
- **THEN** a modal opens showing their friend code with a Copy button

### Requirement: User can add a friend by friend code
The system SHALL allow users to send a friend request by entering another user's friend code.

#### Scenario: Lookup by code succeeds
- **WHEN** user enters a valid friend code in the Add Friend modal and clicks Send
- **THEN** a friend request is sent to the user with that code

#### Scenario: Lookup by code fails
- **WHEN** user enters an invalid friend code
- **THEN** an error message "User not found" is displayed

### Requirement: Duplicate friend requests are prevented
The system SHALL reject friend requests if a pending request already exists (in either direction) or if the users are already friends.

#### Scenario: Pending request exists
- **WHEN** user A sends a request to user B while a pending request already exists
- **THEN** the API returns 409 and shows "Friend request already pending"

#### Scenario: Already friends
- **WHEN** user A sends a request to user B who is already their friend
- **THEN** the API returns 409 and shows "Already friends"

### Requirement: Friend search excludes connected users
The system SHALL exclude users who already have a pending friend request or are already friends from search results.

#### Scenario: Search hides existing friend
- **WHEN** user A searches for user B who is already their friend
- **THEN** user B does not appear in the search results

### Requirement: Friendship stored bidirectionally
The system SHALL store friendship as two rows — one for each direction — so queries can filter by userId alone.

#### Scenario: Accept creates two rows
- **WHEN** user A accepts user B's friend request
- **THEN** rows `(A, B)` and `(B, A)` are inserted into friendships

#### Scenario: Remove deletes both rows
- **WHEN** user A removes user B
- **THEN** both `(A, B)` and `(B, A)` rows are deleted

### Requirement: Sent requests show Cancel button
The system SHALL display a Cancel button for friend requests sent by the current user, and Accept/Decline for requests received.

#### Scenario: Cancel sent request
- **WHEN** user views a pending request they sent
- **THEN** they see "Friend request sent" text and a Cancel button

#### Scenario: Accept/Decline received request
- **WHEN** user views a pending request they received
- **THEN** they see "wants to be your friend" text with Accept and Decline buttons
