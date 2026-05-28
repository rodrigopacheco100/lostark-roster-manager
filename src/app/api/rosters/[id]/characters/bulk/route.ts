import { and, eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { db } from "@/db"
import { characters, rosters } from "@/db/schema"
import { mapAGSClassToLostArk } from "@/lib/ags-class-map"
import { auth } from "@/lib/auth"
import { getRoster } from "@/lib/queries"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const roster = await getRoster(id, session.user.id)
  if (!roster) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const body = await req.json()
  const importCharacters: { guid: string; name: string; agsClass: string; itemLevel: number }[] = body.characters ?? []

  if (!Array.isArray(importCharacters) || importCharacters.length === 0) {
    return NextResponse.json({ error: "No characters provided" }, { status: 400 })
  }

  const existingGuids = new Set(roster.characters.map((c) => c.characterGuid).filter((g): g is string => !!g))

  const toInsert = importCharacters
    .filter((c) => c.guid && !existingGuids.has(c.guid))
    .map((c) => ({
      name: c.name,
      class: mapAGSClassToLostArk(c.agsClass),
      itemLevel: c.itemLevel,
      characterGuid: c.guid,
      rosterId: id,
    }))

  const created: { name: string; characterGuid: string | null }[] = []

  if (toInsert.length > 0) {
    const result = await db.insert(characters).values(toInsert).returning()
    for (const r of result) {
      created.push({ name: r.name, characterGuid: r.characterGuid })
    }
  }

  return NextResponse.json({
    created: created.length,
    skipped: importCharacters.length - toInsert.length,
    characters: created,
  })
}
