import { auth } from "@/lib/auth"
import { getRosters, getFriendshipsBothDirections, getGroupsWithMembers } from "@/lib/queries"
import { NextResponse } from "next/server"

function formatRosters(rosters: Awaited<ReturnType<typeof getRosters>>) {
  return rosters.map((roster) => ({
    rosterId: roster.id,
    rosterName: roster.name,
    characters: roster.characters.map((char) => ({
      id: char.id,
      name: char.name,
      class: char.class,
      itemLevel: char.itemLevel,
      raids: char.characterRaids
        .map((cr) => ({
          characterRaidId: cr.id,
          raidDifficultyId: cr.raidDifficultyId,
          raidDifficultyCreatedAt: cr.raidDifficulty.raid.createdAt.getTime(),
          raidName: cr.raidDifficulty.raid.name,
          difficulty: cr.raidDifficulty.difficulty,
          minIlvl: cr.raidDifficulty.minIlvl,
          completed: cr.completed,
        }))
        .sort((a, b) => a.minIlvl - b.minIlvl || a.raidDifficultyCreatedAt - b.raidDifficultyCreatedAt),
    })),
    totalRaidsAssigned: roster.characters.reduce((s, c) => s + c.characterRaids.length, 0),
    totalCharacters: roster.characters.length,
  }))
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const [myRosters, friendships, groupMemberships] = await Promise.all([
    getRosters(session.user.id),
    getFriendshipsBothDirections(session.user.id),
    getGroupsWithMembers(session.user.id),
  ])

  const friendIds = new Set<string>()
  const friendNames = new Map<string, string>()
  for (const f of friendships) {
    if (f.userId === session.user.id) {
      friendIds.add(f.friendId)
      friendNames.set(f.friendId, f.friend.name)
    } else {
      friendIds.add(f.userId)
      friendNames.set(f.userId, f.user.name)
    }
  }

  const ownerGroups = new Map<string, string[]>()
  const groupMemberIds = new Set<string>()

  for (const gm of groupMemberships) {
    for (const member of gm.group.members) {
      if (member.user.id === session.user.id) continue
      groupMemberIds.add(member.user.id)
      const existing = ownerGroups.get(member.user.id) ?? []
      if (!existing.includes(gm.group.name)) {
        existing.push(gm.group.name)
      }
      ownerGroups.set(member.user.id, existing)
    }
  }

  const friendRostersPromises = Array.from(friendIds).map(async (friendId) => ({
    ownerId: friendId,
    ownerName: friendNames.get(friendId) ?? "Friend",
    groups: ownerGroups.get(friendId) ?? [],
    rosters: formatRosters(await getRosters(friendId)),
  }))
  const friendRosters = await Promise.all(friendRostersPromises)

  const groupRosterPromises = Array.from(groupMemberIds)
    .filter((memberId) => !friendIds.has(memberId))
    .map(async (memberId) => ({
      ownerId: memberId,
      ownerName: memberId,
      groups: ownerGroups.get(memberId) ?? [],
      rosters: null as Awaited<ReturnType<typeof formatRosters>> | null,
    }))
  const groupRosterEntries = await Promise.all(groupRosterPromises)

  for (const entry of groupRosterEntries) {
    const rosters = await getRosters(entry.ownerId)
    entry.rosters = formatRosters(rosters)
    const member = groupMemberships
      .flatMap((gm) => gm.group.members)
      .find((m) => m.user.id === entry.ownerId)
    entry.ownerName = member?.user.name ?? "Unknown"
  }

  const allRosters = [
    { owner: { id: session.user.id, name: "Meus Rosters", isMe: true, groups: [] as string[] }, rosters: formatRosters(myRosters) },
    ...friendRosters
      .filter((fr) => fr.rosters.length > 0)
      .map((fr) => ({
        owner: { id: fr.ownerId, name: fr.ownerName, isMe: false, groups: fr.groups },
        rosters: fr.rosters,
      })),
    ...groupRosterEntries
      .filter((ge) => ge.rosters && ge.rosters.length > 0)
      .map((ge) => ({
        owner: { id: ge.ownerId, name: ge.ownerName, isMe: false, groups: ge.groups },
        rosters: ge.rosters!,
      })),
  ]

  let totalAssigned = 0
  let totalCompleted = 0
  for (const group of allRosters) {
    for (const roster of group.rosters) {
      totalAssigned += roster.totalRaidsAssigned
      for (const char of roster.characters) {
        totalCompleted += char.raids.filter((r) => r.completed).length
      }
    }
  }

  return NextResponse.json({
    rosters: allRosters,
    summary: { totalAssigned, totalCompleted },
  })
}
