import { NextResponse } from "next/server"
import { db } from "@/db"
import { characters, rosters } from "@/db/schema"
import { mapAGSClassToLostArk } from "@/lib/ags-class-map"
import { auth } from "@/lib/auth"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const name: string | undefined = body.name
  const rosterGuid: string | undefined = body.rosterGuid
  const importCharacters: { guid: string; name: string; agsClass: string; itemLevel: number }[] = body.characters ?? []

  if (!name?.trim()) {
    return NextResponse.json({ error: "Roster name is required" }, { status: 400 })
  }

  if (!Array.isArray(importCharacters) || importCharacters.length === 0) {
    return NextResponse.json({ error: "Select at least one character" }, { status: 400 })
  }

  const [roster] = await db
    .insert(rosters)
    .values({ name: name.trim(), userId: session.user.id, rosterGuid })
    .returning()

  const toInsert = importCharacters.map((c) => ({
    name: c.name,
    class: mapAGSClassToLostArk(c.agsClass),
    itemLevel: c.itemLevel,
    characterGuid: c.guid,
    rosterId: roster.id,
  }))

  await db.insert(characters).values(toInsert)

  return NextResponse.json(roster, { status: 201 })
}
