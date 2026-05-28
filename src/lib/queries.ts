import { and, asc, desc, eq, inArray, like, not, or, sql } from "drizzle-orm"
import { db } from "@/db"
import {
  characterRaids,
  characters,
  FriendRequestStatus,
  friendRequests,
  friendships,
  GroupRole,
  groupBans,
  groupMembers,
  groups,
  raidDifficulties,
  raids,
  rosters,
  users,
} from "@/db/schema"

/* ───────── ROSTERS ───────── */
export function getRosters(userId: string) {
  return db.query.rosters.findMany({
    where: eq(rosters.userId, userId),
    orderBy: [asc(rosters.sortOrder), asc(rosters.createdAt)],
    with: {
      characters: {
        orderBy: [asc(characters.sortOrder), asc(characters.createdAt)],
        with: {
          characterRaids: {
            with: {
              raidDifficulty: {
                with: { raid: true },
              },
            },
          },
        },
      },
    },
  })
}

export function getRoster(id: string, userId: string) {
  return db.query.rosters.findFirst({
    where: and(eq(rosters.id, id), eq(rosters.userId, userId)),
    with: {
      characters: {
        orderBy: [asc(characters.sortOrder), asc(characters.createdAt)],
        with: {
          characterRaids: {
            with: {
              raidDifficulty: {
                with: { raid: true },
              },
            },
          },
        },
      },
    },
  })
}

export function createRoster(name: string, userId: string) {
  return db.insert(rosters).values({ name, userId }).returning()
}

export function updateRoster(id: string, userId: string, name: string) {
  return db
    .update(rosters)
    .set({ name })
    .where(and(eq(rosters.id, id), eq(rosters.userId, userId)))
    .returning()
}

export function deleteRoster(id: string, userId: string) {
  return db
    .delete(rosters)
    .where(and(eq(rosters.id, id), eq(rosters.userId, userId)))
    .returning()
}

export function reorderRosters(ids: string[], userId: string) {
  return db.transaction(async (tx) => {
    for (let i = 0; i < ids.length; i++) {
      await tx
        .update(rosters)
        .set({ sortOrder: i })
        .where(and(eq(rosters.id, ids[i]), eq(rosters.userId, userId)))
    }
  })
}

export function reorderCharacters(ids: string[], rosterId: string) {
  return db.transaction(async (tx) => {
    for (let i = 0; i < ids.length; i++) {
      await tx
        .update(characters)
        .set({ sortOrder: i })
        .where(and(eq(characters.id, ids[i]), eq(characters.rosterId, rosterId)))
    }
  })
}

/* ───────── CHARACTERS ───────── */
export function getCharacters(rosterId: string) {
  return db.query.characters.findMany({
    where: eq(characters.rosterId, rosterId),
    orderBy: [asc(characters.sortOrder), asc(characters.createdAt)],
  })
}

export function createCharacter(data: typeof characters.$inferInsert) {
  return db.insert(characters).values(data).returning()
}

export function updateCharacter(id: string, data: Partial<typeof characters.$inferInsert>) {
  return db.update(characters).set(data).where(eq(characters.id, id)).returning()
}

export function deleteCharacter(id: string) {
  return db.delete(characters).where(eq(characters.id, id)).returning()
}

/* ───────── FRIENDS ───────── */
export function searchUsers(query: string, currentUserId: string) {
  return db
    .select()
    .from(users)
    .where(
      and(
        not(eq(users.id, currentUserId)),
        not(
          inArray(
            users.id,
            db
              .select({
                targetId: sql<string>`CASE WHEN ${friendRequests.senderId} = ${currentUserId} THEN ${friendRequests.receiverId} ELSE ${friendRequests.senderId} END`,
              })
              .from(friendRequests)
              .where(
                and(
                  or(eq(friendRequests.senderId, currentUserId), eq(friendRequests.receiverId, currentUserId)),
                  eq(friendRequests.status, FriendRequestStatus.Pending),
                ),
              ),
          ),
        ),
        not(
          inArray(
            users.id,
            db
              .select({
                targetId: sql<string>`CASE WHEN ${friendships.userId} = ${currentUserId} THEN ${friendships.friendId} ELSE ${friendships.userId} END`,
              })
              .from(friendships)
              .where(or(eq(friendships.userId, currentUserId), eq(friendships.friendId, currentUserId))),
          ),
        ),
        or(like(users.name, `%${query}%`), like(users.email, `%${query}%`), like(users.friendCode, `%${query}%`)),
      ),
    )
    .limit(20)
}

export function getFriendRequests(userId: string) {
  return db.query.friendRequests.findMany({
    where: or(eq(friendRequests.senderId, userId), eq(friendRequests.receiverId, userId)),
    with: {
      sender: true,
      receiver: true,
    },
  })
}

export function getFriendships(userId: string) {
  return db.query.friendships.findMany({
    where: eq(friendships.userId, userId),
    with: { friend: true },
  })
}

export function getFriendshipsBothDirections(userId: string) {
  return db.query.friendships.findMany({
    where: or(eq(friendships.userId, userId), eq(friendships.friendId, userId)),
    with: { user: true, friend: true },
  })
}

export function sendFriendRequest(senderId: string, receiverId: string) {
  return db.insert(friendRequests).values({ senderId, receiverId }).returning()
}

export function respondToRequest(requestId: string, status: FriendRequestStatus) {
  return db.update(friendRequests).set({ status }).where(eq(friendRequests.id, requestId)).returning()
}

export function createFriendship(userId: string, friendId: string) {
  return db.insert(friendships).values({ userId, friendId }).returning()
}

export function removeFriendship(userId: string, friendId: string) {
  return db
    .delete(friendships)
    .where(and(eq(friendships.userId, userId), eq(friendships.friendId, friendId)))
    .returning()
}

/* ───────── RAIDS (global) ───────── */
export function getAllRaids() {
  return db.query.raids.findMany({
    with: { difficulties: true },
    orderBy: desc(raids.createdAt),
  })
}

export function getAllRaidsWithDifficulties() {
  return db.query.raids.findMany({
    with: { difficulties: true },
  })
}

export function createRaid(slug: string, name: string) {
  return db.insert(raids).values({ slug, name }).returning()
}

export function deleteRaid(id: string) {
  return db.delete(raids).where(eq(raids.id, id)).returning()
}

/* ───────── RAID DIFFICULTIES ───────── */
export function addRaidDifficulty(raidId: string, difficulty: string, minIlvl: number) {
  return db.insert(raidDifficulties).values({ raidId, difficulty, minIlvl }).returning()
}

export function removeRaidDifficulty(id: string) {
  return db.delete(raidDifficulties).where(eq(raidDifficulties.id, id)).returning()
}

/* ───────── CHARACTER RAIDS ───────── */
export function getCharacterRaids(characterId: string) {
  return db.query.characterRaids.findMany({
    where: eq(characterRaids.characterId, characterId),
    with: {
      raidDifficulty: {
        with: { raid: true },
      },
    },
  })
}

export function assignRaidToCharacter(characterId: string, raidDifficultyId: string) {
  return db.insert(characterRaids).values({ characterId, raidDifficultyId }).returning()
}

export function removeCharacterRaid(id: string) {
  return db.delete(characterRaids).where(eq(characterRaids.id, id)).returning()
}

export function toggleRaidCompletion(characterId: string, raidDifficultyId: string, completed: boolean) {
  return db
    .update(characterRaids)
    .set({ completed })
    .where(and(eq(characterRaids.characterId, characterId), eq(characterRaids.raidDifficultyId, raidDifficultyId)))
    .returning()
}

export function getCharacterWithRoster(characterId: string) {
  return db.query.characters.findFirst({
    where: eq(characters.id, characterId),
    with: { roster: true },
  })
}

export function syncCharacterRaids(characterId: string, desiredRaidDifficultyIds: string[]) {
  return db.transaction(async (tx) => {
    const character = await tx.query.characters.findFirst({
      where: eq(characters.id, characterId),
    })
    if (!character) throw new Error("Character not found")

    if (desiredRaidDifficultyIds.length > 3) {
      throw new Error("Character can have at most 3 raids")
    }

    const existing = await tx.query.characterRaids.findMany({
      where: eq(characterRaids.characterId, characterId),
      with: {
        raidDifficulty: {
          with: { raid: true },
        },
      },
    })

    let desiredRds: {
      id: string
      raidId: string
      difficulty: string
      minIlvl: number
      raid: { id: string; name: string }
    }[] = []
    if (desiredRaidDifficultyIds.length > 0) {
      desiredRds = await tx.query.raidDifficulties.findMany({
        where: inArray(raidDifficulties.id, desiredRaidDifficultyIds),
        with: { raid: true },
      })
    }

    const seenRaidIds = new Set<string>()

    for (const rd of desiredRds) {
      if (seenRaidIds.has(rd.raid.id)) {
        throw new Error(`Cannot have two difficulties of the same raid (${rd.raid.name})`)
      }
      seenRaidIds.add(rd.raid.id)

      if (character.itemLevel < rd.minIlvl) {
        throw new Error(`Item level too low for ${rd.raid.name} - ${rd.difficulty}`)
      }
    }

    const existingIds = new Set(existing.map((cr) => cr.raidDifficultyId))
    const toAdd = desiredRaidDifficultyIds.filter((id) => !existingIds.has(id))
    const toRemove = existing.filter((cr) => !desiredRaidDifficultyIds.includes(cr.raidDifficultyId))

    if (toAdd.length > 0) {
      await tx.insert(characterRaids).values(toAdd.map((rdId) => ({ characterId, raidDifficultyId: rdId })))
    }
    for (const cr of toRemove) {
      await tx.delete(characterRaids).where(eq(characterRaids.id, cr.id))
    }

    return { added: toAdd.length, removed: toRemove.length }
  })
}

/* ───────── GROUPS ───────── */
export function getUserGroups(userId: string) {
  return db.query.groupMembers.findMany({
    where: eq(groupMembers.userId, userId),
    with: {
      group: {
        with: {
          members: {
            columns: { id: true },
          },
        },
      },
    },
  })
}

export function getGroupDetails(groupId: string, userId: string) {
  return db.query.groupMembers.findFirst({
    where: and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)),
    with: {
      group: {
        with: {
          members: {
            with: { user: { columns: { id: true, name: true, image: true } } },
          },
          bans: {
            with: { user: { columns: { id: true, name: true, image: true } } },
          },
        },
      },
    },
  })
}

export function createGroup(name: string, userId: string) {
  const inviteCode = `GC${Date.now()}`
  return db.transaction(async (tx) => {
    const [group] = await tx.insert(groups).values({ name, inviteCode }).returning()
    await tx.insert(groupMembers).values({ groupId: group.id, userId, role: GroupRole.Owner })
    return group
  })
}

export function deleteGroup(groupId: string, _userId: string) {
  return db.delete(groups).where(eq(groups.id, groupId)).returning()
}

export function getGroupOwner(groupId: string) {
  return db.query.groupMembers.findFirst({
    where: and(eq(groupMembers.groupId, groupId), eq(groupMembers.role, GroupRole.Owner)),
  })
}

export function transferOwnership(groupId: string, fromUserId: string, toUserId: string) {
  return db.transaction(async (tx) => {
    await tx
      .update(groupMembers)
      .set({ role: GroupRole.Member })
      .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, fromUserId)))
    await tx
      .update(groupMembers)
      .set({ role: GroupRole.Owner })
      .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, toUserId)))
  })
}

export function updateGroupName(groupId: string, _userId: string, name: string) {
  return db.update(groups).set({ name }).where(eq(groups.id, groupId)).returning()
}

export function changeMemberRole(groupId: string, targetUserId: string, role: GroupRole) {
  return db
    .update(groupMembers)
    .set({ role })
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, targetUserId)))
    .returning()
}

export function joinGroup(groupId: string, userId: string) {
  return db.insert(groupMembers).values({ groupId, userId, role: GroupRole.Member }).returning()
}

export function leaveGroup(groupId: string, userId: string) {
  return db
    .delete(groupMembers)
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)))
    .returning()
}

export function getGroupMember(groupId: string, userId: string) {
  return db.query.groupMembers.findFirst({
    where: and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)),
    with: { user: { columns: { id: true, name: true, image: true } } },
  })
}

export function isUserBanned(groupId: string, userId: string) {
  return db.query.groupBans.findFirst({
    where: and(eq(groupBans.groupId, groupId), eq(groupBans.userId, userId)),
  })
}

export function getGroupMemberByRole(groupId: string, role: GroupRole) {
  return db.query.groupMembers.findMany({
    where: and(eq(groupMembers.groupId, groupId), eq(groupMembers.role, role)),
  })
}

export function kickMember(groupId: string, targetUserId: string) {
  return db
    .delete(groupMembers)
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, targetUserId)))
    .returning()
}

export function banUser(groupId: string, userId: string) {
  return db.transaction(async (tx) => {
    await tx.delete(groupMembers).where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)))
    const [ban] = await tx.insert(groupBans).values({ groupId, userId }).returning()
    return ban
  })
}

export function unbanUser(groupId: string, userId: string) {
  return db
    .delete(groupBans)
    .where(and(eq(groupBans.groupId, groupId), eq(groupBans.userId, userId)))
    .returning()
}

export function getGroupByInviteCode(code: string) {
  return db.query.groups.findFirst({
    where: eq(groups.inviteCode, code),
    columns: { id: true, name: true, inviteCode: true },
    with: {
      members: {
        columns: { id: true },
      },
    },
  })
}

export function getGroupsWithMembers(userId: string) {
  return db.query.groupMembers.findMany({
    where: eq(groupMembers.userId, userId),
    with: {
      group: {
        with: {
          members: {
            with: {
              user: { columns: { id: true, name: true, image: true } },
            },
          },
        },
      },
    },
  })
}
