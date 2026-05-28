import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getRoster, reorderCharacters } from "@/lib/queries"

export async function PUT(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { ids, rosterId } = body as { ids: string[]; rosterId: string }
  if (!Array.isArray(ids) || ids.length === 0 || !rosterId) {
    return NextResponse.json({ error: "ids array and rosterId are required" }, { status: 400 })
  }

  const roster = await getRoster(rosterId, session.user.id)
  if (!roster) {
    return NextResponse.json({ error: "Roster not found" }, { status: 404 })
  }

  await reorderCharacters(ids, rosterId)
  return NextResponse.json({ success: true })
}
