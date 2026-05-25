## Why

The current friend system requires each user to individually add every friend they want to track on the dashboard. Friend groups solve this by allowing users to join a shared group, automatically adding all members' rosters to the dashboard without manual friend requests. This reduces friction for communities (e.g., guilds, static raid groups) where everyone needs to see each other's progress.

## What Changes

- Create group entities with roles: owner, admin, participant
- Add group invite codes for sharing join links
- Add group membership management (join, leave, kick, ban, unban)
- Add role-based permissions (member view/leave, admin kick/ban/unban, owner transfer/role-assign/delete)
- Integrate groups into the dashboard: groups appear alongside friends as roster sources, with group names shown in parentheses next to member names
- Add a groups page for managing your groups (create, invite, manage members, view pending joins)

## Capabilities

### New Capabilities
- `group-crud`: Create, update, delete groups; transfer ownership
- `group-membership`: Join via invite code, leave, kick, ban, unban; role management (admin/member)
- `group-dashboard`: Dashboard integration — group members' rosters appear alongside friends' rosters with group name annotation

### Modified Capabilities

<!-- No existing capabilities are modified — this is a net-new feature -->

## Impact

- **Database**: New tables: `groups`, `group_members`, `group_bans`
- **API routes**: New endpoints under `/api/groups/` (CRUD, membership, invite, bans, dashboard data)
- **Query layer**: New group query functions in `src/lib/queries.ts`
- **Frontend**: New groups page under `/(dashboard)/groups/`; dashboard API modification to include group members' rosters with group name annotations
- **Auth**: All group endpoints require authentication (existing middleware covers this)
