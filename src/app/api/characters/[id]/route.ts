import { auth } from "@/lib/auth"
import { updateCharacter, deleteCharacter } from "@/lib/queries"
import { updateCharacterSchema } from "@/lib/validations"
import { NextResponse } from "next/server"

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = updateCharacterSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const updated = await updateCharacter(params.id, parsed.data)
  if (!updated.length) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json(updated[0])
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const deleted = await deleteCharacter(params.id)
  if (!deleted.length) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json({ success: true })
}
