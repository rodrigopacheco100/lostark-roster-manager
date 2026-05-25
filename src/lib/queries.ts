import { db } from "@/db"
import {
  rosters, characters, friendRequests, friendships, users,
  raids, raidDifficulties, characterRaids, FriendRequestStatus, LostArkClass,
} from "@/db/schema"
import { eq, and, or, like, not, inArray, sql } from "drizzle-orm"

/* ───────── ROSTERS ───────── */
export function getRosters(userId: string) {
  return db.query.rosters.findMany({
    where: eq(rosters.userId, userId),
    with: {
      characters: {
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

/* ───────── CHARACTERS ───────── */
export function getCharacters(rosterId: string) {
  return db.query.characters.findMany({
    where: eq(characters.rosterId, rosterId),
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
              .where(
                or(eq(friendships.userId, currentUserId), eq(friendships.friendId, currentUserId)),
              ),
          ),
        ),
        or(
          like(users.name, `%${query}%`),
          like(users.email, `%${query}%`),
          like(users.friendCode, `%${query}%`),
        ),
      ),
    )
    .limit(20)
}

export function getFriendRequests(userId: string) {
  return db.query.friendRequests.findMany({
    where: or(
      eq(friendRequests.senderId, userId),
      eq(friendRequests.receiverId, userId),
    ),
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
  return db
    .insert(friendRequests)
    .values({ senderId, receiverId })
    .returning()
}

export function respondToRequest(requestId: string, status: FriendRequestStatus) {
  return db
    .update(friendRequests)
    .set({ status })
    .where(eq(friendRequests.id, requestId))
    .returning()
}

export function createFriendship(userId: string, friendId: string) {
  return db.insert(friendships).values({ userId, friendId }).returning()
}

export function removeFriendship(userId: string, friendId: string) {
  return db
    .delete(friendships)
    .where(
      and(
        eq(friendships.userId, userId),
        eq(friendships.friendId, friendId),
      ),
    )
    .returning()
}

/* ───────── RAIDS (global) ───────── */
export function getAllRaids() {
  return db.query.raids.findMany({
    with: { difficulties: true },
  })
}

export function getAllRaidsWithDifficulties() {
  return db.query.raids.findMany({
    with: { difficulties: true },
  })
}

export function createRaid(name: string) {
  return db.insert(raids).values({ name }).returning()
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
