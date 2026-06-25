import { and, eq, isNotNull } from "drizzle-orm"
import { NextResponse } from "next/server"
import { db } from "@/db"
import { characters, rosters } from "@/db/schema"
import { getRosterByGuid } from "@/lib/ags-api"
import { auth } from "@/lib/auth"
import { env } from "@/lib/env"

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (!env.AGS_API_KEY) {
    return NextResponse.json({ error: "AGS_API_KEY is not configured" }, { status: 400 })
  }

  const userRosters = await db.query.rosters.findMany({
    where: and(eq(rosters.userId, session.user.id), isNotNull(rosters.rosterGuid)),
    columns: { id: true, name: true, rosterGuid: true },
    with: {
      characters: {
        columns: { id: true, name: true, characterGuid: true, itemLevel: true },
        where: isNotNull(characters.characterGuid),
      },
    },
  })

  if (userRosters.length === 0) {
    return NextResponse.json({ error: "No linked rosters found" }, { status: 400 })
  }

  let totalUpdated = 0
  const results: { roster: string; updated: number; error?: string }[] = []

  for (const roster of userRosters) {
    try {
      const agsData = await getRosterByGuid(roster.rosterGuid!)
      const guidMap = new Map(agsData.characters.map((c) => [c.guid, c.item_level]))

      let rosterUpdated = 0
      for (const character of roster.characters) {
        const newIlvl = guidMap.get(character.characterGuid!)
        if (newIlvl !== undefined && newIlvl !== character.itemLevel) {
          await db.update(characters).set({ itemLevel: Math.floor(newIlvl) }).where(eq(characters.id, character.id))
          rosterUpdated++
        }
      }

      totalUpdated += rosterUpdated
      results.push({ roster: roster.name, updated: rosterUpdated })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error"
      results.push({ roster: roster.name, updated: 0, error: message })
    }
  }

  return NextResponse.json({ updated: totalUpdated, results })
}
