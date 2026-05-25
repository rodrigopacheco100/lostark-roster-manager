import { auth } from "@/lib/auth"
import { getCharacterRaids, assignRaidToCharacter, removeCharacterRaid } from "@/lib/queries"
import { db } from "@/db"
import { raidDifficulties } from "@/db/schema"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const data = await getCharacterRaids(params.id)
  return NextResponse.json(data)
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { raidDifficultyId } = await req.json()
  if (!raidDifficultyId) return NextResponse.json({ error: "raidDifficultyId required" }, { status: 400 })

  const existing = await getCharacterRaids(params.id)
  if (existing.length >= 3) {
    return NextResponse.json({ error: "Character can have at most 3 raids" }, { status: 400 })
  }

  const rd = await db.query.raidDifficulties.findFirst({
    where: eq(raidDifficulties.id, raidDifficultyId),
    with: { raid: true },
  })
  if (!rd) return NextResponse.json({ error: "Raid difficulty not found" }, { status: 404 })

  const alreadyHasRaid = existing.some((cr) => cr.raidDifficulty.raid.id === rd.raid.id)
  if (alreadyHasRaid) {
    return NextResponse.json({ error: "Character already has this raid assigned" }, { status: 400 })
  }

  const [result] = await assignRaidToCharacter(params.id, raidDifficultyId)
  return NextResponse.json(result, { status: 201 })
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const characterRaidId = searchParams.get("characterRaidId")
  if (!characterRaidId) return NextResponse.json({ error: "characterRaidId required" }, { status: 400 })

  await removeCharacterRaid(characterRaidId)
  return NextResponse.json({ success: true })
}
