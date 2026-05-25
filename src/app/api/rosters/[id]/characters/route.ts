import { auth } from "@/lib/auth"
import { getCharacters, createCharacter } from "@/lib/queries"
import { getRoster } from "@/lib/queries"
import { createCharacterSchema } from "@/lib/validations"
import { NextResponse } from "next/server"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const roster = await getRoster(params.id, session.user.id)
  if (!roster) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const chars = await getCharacters(params.id)
  return NextResponse.json(chars)
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const roster = await getRoster(params.id, session.user.id)
  if (!roster) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const body = await req.json()
  const parsed = createCharacterSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const char = await createCharacter({
    name: parsed.data.name,
    class: parsed.data.class,
    itemLevel: parsed.data.itemLevel,
    rosterId: params.id,
  })
  return NextResponse.json(char[0], { status: 201 })
}
