import { and, eq, inArray } from "drizzle-orm"
import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/db"
import { characterRaids, characters } from "@/db/schema"
import { auth } from "@/lib/auth"

const batchSchema = z.object({
  updates: z
    .array(
      z.object({
        characterId: z.string(),
        raidDifficultyId: z.string(),
        completed: z.boolean(),
      }),
    )
    .min(1)
    .max(50),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })

  const parsed = batchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 })

  const { updates } = parsed.data
  const charIds = [...new Set(updates.map((u) => u.characterId))]
  const chars = await db.query.characters.findMany({
    where: inArray(characters.id, charIds),
    with: { roster: true },
  })

  const charMap = new Map(chars.map((c) => [c.id, c]))

  for (const id of charIds) {
    const char = charMap.get(id)
    if (!char) return NextResponse.json({ error: `Character not found: ${id}` }, { status: 404 })
    if (char.roster.userId !== session.user.id) {
      return NextResponse.json({ error: `Forbidden: not owner of character ${id}` }, { status: 403 })
    }
  }

  await db.transaction(async (tx) => {
    await Promise.all(
      updates.map(({ characterId, raidDifficultyId, completed }) =>
        tx
          .update(characterRaids)
          .set({ completed })
          .where(
            and(eq(characterRaids.characterId, characterId), eq(characterRaids.raidDifficultyId, raidDifficultyId)),
          ),
      ),
    )
  })

  return NextResponse.json({ updated: updates.length })
}
