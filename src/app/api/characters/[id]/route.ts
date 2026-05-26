import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { deleteCharacter, updateCharacter } from "@/lib/queries"
import { updateCharacterSchema } from "@/lib/validations"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = updateCharacterSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const updated = await updateCharacter(id, parsed.data)
  if (!updated.length) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json(updated[0])
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const deleted = await deleteCharacter(id)
  if (!deleted.length) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json({ success: true })
}
