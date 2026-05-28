import { NextResponse } from "next/server"
import { getCharacterByName, getRosterByGuid } from "@/lib/ags-api"
import { mapAGSClassToLostArk } from "@/lib/ags-class-map"
import { auth } from "@/lib/auth"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const region = String(body.region ?? "NA")
  const characterName = String(body.characterName ?? "")

  if (!characterName.trim()) {
    return NextResponse.json({ error: "Character name is required" }, { status: 400 })
  }

  try {
    const character = await getCharacterByName(region, characterName.trim())
    const agsRoster = await getRosterByGuid(character.roster_guid)

    const characters = agsRoster.characters
      .map((c) => ({
        guid: c.guid,
        name: c.name,
        class: mapAGSClassToLostArk(c.class),
        agsClass: c.class,
        itemLevel: Math.floor(c.item_level),
      }))
      .sort((a, b) => b.itemLevel - a.itemLevel)

    return NextResponse.json({
      rosterGuid: agsRoster.guid,
      region: agsRoster.region,
      world: agsRoster.world,
      characters,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch roster data"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
