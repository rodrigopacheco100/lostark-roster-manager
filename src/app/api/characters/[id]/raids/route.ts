import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/db"
import { raidDifficulties } from "@/db/schema"
import { auth } from "@/lib/auth"
import {
  assignRaidToCharacter,
  getCharacterRaids,
  getCharacterWithRoster,
  removeCharacterRaid,
  syncCharacterRaids,
  toggleRaidCompletion,
} from "@/lib/queries"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const data = await getCharacterRaids(id)
  return NextResponse.json(data)
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { raidDifficultyId } = await req.json()
  if (!raidDifficultyId) return NextResponse.json({ error: "raidDifficultyId required" }, { status: 400 })

  const existing = await getCharacterRaids(id)
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

  const [result] = await assignRaidToCharacter(id, raidDifficultyId)
  return NextResponse.json(result, { status: 201 })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const characterRaidId = searchParams.get("characterRaidId")
  if (!characterRaidId) return NextResponse.json({ error: "characterRaidId required" }, { status: 400 })

  await removeCharacterRaid(characterRaidId)
  return NextResponse.json({ success: true })
}

const putSchema = z.object({
  raidDifficultyIds: z.array(z.string()).max(3),
})

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const character = await getCharacterWithRoster(id)
  if (!character) return NextResponse.json({ error: "Character not found" }, { status: 404 })
  if (character.roster.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })

  const parsed = putSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: `Invalid request: ${parsed.error.message}` }, { status: 400 })
  }

  try {
    const result = await syncCharacterRaids(id, parsed.data.raidDifficultyIds)
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    if (message.includes("already has")) return NextResponse.json({ error: message }, { status: 409 })
    if (message.includes("at most 3") || message.includes("too low") || message.includes("same raid")) {
      return NextResponse.json({ error: message }, { status: 400 })
    }
    if (message.includes("not found")) return NextResponse.json({ error: message }, { status: 404 })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

const toggleSchema = z.object({
  raidDifficultyId: z.string(),
  completed: z.boolean(),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })

  const parsed = toggleSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { raidDifficultyId, completed } = parsed.data

  const character = await getCharacterWithRoster(id)
  if (!character) return NextResponse.json({ error: "Character not found" }, { status: 404 })

  if (character.roster.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const [result] = await toggleRaidCompletion(id, raidDifficultyId, completed)
  if (!result) return NextResponse.json({ error: "Raid assignment not found" }, { status: 404 })

  return NextResponse.json(result)
}
