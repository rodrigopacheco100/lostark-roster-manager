## 1. Database Schema

- [x] 1.1 Add `groups` table to `src/db/schema/index.ts` (id, name, inviteCode, createdAt)
- [x] 1.2 Add `group_members` table to schema (id, groupId, userId, role enum, joinedAt) with unique constraint on (groupId, userId)
- [x] 1.3 Add `group_bans` table to schema (id, groupId, userId, createdAt)
- [x] 1.4 Add Drizzle relations for groups, group_members, group_bans linking to users
- [x] 1.5 Generate and run Drizzle migration

## 2. Query Layer

- [x] 2.1 Add `getUserGroups(userId)` — returns groups user belongs to with their role
- [x] 2.2 Add `getGroupDetails(groupId, userId)` — returns group with members, invite code, bans; gated on membership
- [x] 2.3 Add `createGroup(name, userId)` — creates group, generates invite code via crypto, inserts owner membership
- [x] 2.4 Add `deleteGroup(groupId, userId)` — owner-only; deletes group (cascades members/bans)
- [x] 2.5 Add `transferOwnership(groupId, fromUserId, toUserId)` — swaps roles
- [x] 2.6 Add `updateGroupName(groupId, userId, name)` — owner-only rename
- [x] 2.7 Add `changeMemberRole(groupId, ownerId, targetUserId, newRole)` — owner-only role change
- [x] 2.8 Add `joinGroup(groupId, userId, inviteCode)` — validates code, checks ban, inserts member
- [x] 2.9 Add `leaveGroup(groupId, userId)` — removes member (owner blocked)
- [x] 2.10 Add `kickMember(groupId, adminId, targetUserId)` — admin+ removes member
- [x] 2.11 Add `banUser(groupId, adminId, targetUserId)` — admin+ inserts ban and removes member if present
- [x] 2.12 Add `unbanUser(groupId, adminId, targetUserId)` — admin+ removes ban row
- [x] 2.13 Add `getGroupByInviteCode(code)` — returns group info for join page
- [x] 2.14 Add `getGroupsWithMembers(userId)` — returns all groups user is in, with member lists (for dashboard integration)

## 3. API Routes — Group CRUD

- [x] 3.1 Create `GET /api/groups` — list user's groups
- [x] 3.2 Create `POST /api/groups` — create group (validates name with Zod)
- [x] 3.3 Create `GET /api/groups/[id]` — group details
- [x] 3.4 Create `PUT /api/groups/[id]` — rename group
- [x] 3.5 Create `DELETE /api/groups/[id]` — delete group

## 4. API Routes — Group Ownership & Roles

- [x] 4.1 Create `POST /api/groups/[id]/transfer` — transfer ownership
- [x] 4.2 Create `PUT /api/groups/[id]/members/[userId]/role` — change member role
- [x] 4.3 Create `POST /api/groups/[id]/kick` — kick member
- [x] 4.4 Create `POST /api/groups/[id]/ban` — ban user
- [x] 4.5 Create `POST /api/groups/[id]/unban` — unban user

## 5. API Routes — Membership & Invite

- [x] 5.1 Create `GET /api/groups/join?code=XXX` — resolve invite code to group info
- [x] 5.2 Create `POST /api/groups/[id]/join` — join group via invite code
- [x] 5.3 Create `POST /api/groups/[id]/leave` — leave group

## 6. Dashboard Integration

- [x] 6.1 Add group roster aggregation to `GET /api/dashboard` — fetch group members' rosters alongside friends'
- [x] 6.2 Add `owner.groups` field to dashboard response with group name annotations
- [x] 6.3 Deduplicate owners who appear both as friend and group member

## 7. Frontend — Groups Page

- [x] 7.1 Create `/(dashboard)/groups/page.tsx` — list groups with create button
- [x] 7.2 Add group creation modal (name input, submit)
- [x] 7.3 Add group detail page `/(dashboard)/groups/[id]/page.tsx` — members list, invite code display with copy, role badges
- [x] 7.4 Add member management UI (kick, ban, promote/demote buttons per role)
- [x] 7.5 Add transfer ownership UI
- [x] 7.6 Add join group modal (invite code input + resolve)
- [x] 7.7 Add "Leave group" button with confirmation
- [x] 7.8 Add "Delete group" button with confirmation (owner only)

## 8. Frontend — Dashboard Update

- [x] 8.1 Update OwnerSection to display `owner.groups` annotation in parentheses next to owner name
- [x] 8.2 Verify existing friend-only dashboard still renders correctly when `groups` is empty array

## 9. Sidebar & Navigation

- [x] 9.1 Add "Grupos" link to Sidebar component
