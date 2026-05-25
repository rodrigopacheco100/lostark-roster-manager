## Context

The app currently shows rosters from the authenticated user and their friends on the dashboard. The friend system uses a two-way confirmation model (send request → accept → friendship row). For groups, we need a simpler model where any group member can invite others via a shareable invite code, and once joined, all members see each other's rosters on the dashboard.

The existing codebase uses Next.js 14 App Router, Drizzle ORM with PostgreSQL, NextAuth v5, and Tailwind CSS. The dashboard aggregates rosters across friends via `getFriendshipsBothDirections()`.

## Goals / Non-Goals

**Goals:**
- Users can create groups and become owner
- Owners can transfer ownership, promote/demote admins, delete the group
- Admins can kick members, ban/unban users
- Members can leave the group and view all participants
- Groups have unique invite codes; any member can share the code
- Users join groups via invite code link (if not banned)
- Dashboard shows group members' rosters alongside friends' rosters, with group names in parentheses
- A new groups page (sidebar link) for managing groups

**Non-Goals:**
- Group chat or messaging
- Nested groups or group hierarchies
- Group-specific settings or permissions beyond roles described
- Request-based joining (open invite code model only — no "pending approval" flow)

## Decisions

### Data Model: Single `group_members` table with role column
- A flat membership table with a `role` enum (`owner`, `admin`, `member`) is simpler than separate admin/member tables.
- Ownership transfer is a role update, not row deletion + insertion.
- Rationale: Follows the same pattern as `friend_requests` (one table, status-driven). Avoids over-engineering for a system where a single owner is sufficient.

### Invite Code: Random 8-char alphanumeric, unique per group
- Generated via `crypto.randomBytes(4).toString("hex")` (8 hex chars) at group creation.
- Not user-changeable (simplicity).
- Stored on the `groups` table row.
- Rationale: Hex is URL-safe, collision-resistant for the scale of this app. No need for friend-code-like `FC` prefix since group context is clear.

### Dashboard Integration: Extend existing `/api/dashboard` endpoint
- The dashboard already fetches `getFriendshipsBothDirections()` and then fetches each friend's rosters.
- We will add a similar fetch for groups: `getUserGroupsWithMembers()` → get all unique member IDs → fetch rosters for those members.
- Group name annotation: when returning owner data, include a `groups` array with group names so the frontend can show `"FriendName (GroupA, GroupB)"`.
- Rationale: Minimal changes to the dashboard frontend — just adds group labels to existing OwnerSection headers.

### Ban Enforcement: Server-side check on join
- Bans are stored in a `group_bans` table (userId + groupId + unbannedAt).
- When a user tries to join via invite code, check if a non-revoked ban exists.
- No ban check on dashboard viewing (if someone is already a member, they stay).
- Rationale: Simple, no need for real-time enforcement.

### API Structure: Follow friend system pattern
- All endpoints under `/api/groups/` with Next.js route groups:
  - `GET /api/groups` — list user's groups with member counts
  - `POST /api/groups` — create group (generates invite code)
  - `GET /api/groups/[id]` — group details (members, roles, invite code)
  - `PUT /api/groups/[id]` — update group name
  - `DELETE /api/groups/[id]` — delete group (owner only)
  - `POST /api/groups/[id]/transfer` — transfer ownership
  - `POST /api/groups/[id]/join` — join via invite code
  - `POST /api/groups/[id]/leave` — leave group
  - `POST /api/groups/[id]/kick` — kick member (admin+)
  - `POST /api/groups/[id]/ban` — ban user (admin+)
  - `POST /api/groups/[id]/unban` — unban user (admin+)
  - `PUT /api/groups/[id]/members/[userId]/role` — change role (owner only)
  - `GET /api/groups/join?code=XXX` — resolve invite code to group info

## Risks / Trade-offs

- **No request-based joining**: Members cannot approve/deny join requests. Anyone with the code joins. Mitigation: Ban system prevents unwanted users from re-joining. Owners can regenerate invite codes if leaked.
- **Dashboard query complexity**: For users in many large groups, dashboard queries multiply. Mitigation: Groups are expected to be small (guild rosters of ~8-30 users). Pagination is not needed at this scale.
- **No group roster isolation**: All group members see all other members' rosters. Mitigation: This is the intended design — the whole point is shared visibility. Users who leave a group stop appearing.
- **Invite code visibility**: Currently any member can share the code. No distinction between "invite" and "join" permissions. Mitigation: Future enhancement could restrict code visibility to admins+.
