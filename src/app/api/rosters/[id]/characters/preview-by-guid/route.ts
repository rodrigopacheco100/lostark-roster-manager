import { NextResponse } from "next/server"
import { getRosterByGuid } from "@/lib/ags-api"
import { mapAGSClassToLostArk } from "@/lib/ags-class-map"
import { auth } from "@/lib/auth"
import { getRoster } from "@/lib/queries"

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const roster = await getRoster(id, session.user.id)
  if (!roster) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (!roster.rosterGuid) return NextResponse.json({ error: "Roster has no AGS guid" }, { status: 400 })

  try {
    const agsRoster = await getRosterByGuid(roster.rosterGuid)
    const existingGuids = new Set(roster.characters.map((c) => c.characterGuid).filter(Boolean))

    const characters = agsRoster.characters
      .map((c) => ({
        guid: c.guid,
        name: c.name,
        class: mapAGSClassToLostArk(c.class),
        agsClass: c.class,
        itemLevel: Math.floor(c.item_level),
        alreadyInRoster: existingGuids.has(c.guid),
      }))
      .sort((a, b) => b.itemLevel - a.itemLevel)

    return NextResponse.json({
      region: agsRoster.region,
      world: agsRoster.world,
      characters,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch roster data"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
