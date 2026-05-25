import { auth } from "@/lib/auth"
import { getRosters } from "@/lib/queries"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const rosters = await getRosters(session.user.id)

  const rosterData = rosters.map((roster) => ({
    rosterId: roster.id,
    rosterName: roster.name,
    characters: roster.characters.map((char) => ({
      id: char.id,
      name: char.name,
      class: char.class,
      itemLevel: char.itemLevel,
      raids: char.characterRaids.map((cr) => ({
        raidName: cr.raidDifficulty.raid.name,
        difficulty: cr.raidDifficulty.difficulty,
        minIlvl: cr.raidDifficulty.minIlvl,
      })),
    })),
    totalRaidsAssigned: roster.characters.reduce((s, c) => s + c.characterRaids.length, 0),
    totalCharacters: roster.characters.length,
  }))

  return NextResponse.json({ rosters: rosterData })
}
