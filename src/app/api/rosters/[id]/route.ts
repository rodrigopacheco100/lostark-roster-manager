import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { deleteRoster, getRoster, updateRoster } from "@/lib/queries"
import { updateRosterSchema } from "@/lib/validations"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const roster = await getRoster(id, session.user.id)
  if (!roster) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json(roster)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = updateRosterSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const updated = await updateRoster(id, session.user.id, parsed.data.name)
  if (!updated.length) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json(updated[0])
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const deleted = await deleteRoster(id, session.user.id)
  if (!deleted.length) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json({ success: true })
}
