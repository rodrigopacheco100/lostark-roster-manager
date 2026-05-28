import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { reorderRosters } from "@/lib/queries"

export async function PUT(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { ids } = body as { ids: string[] }
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "ids array is required" }, { status: 400 })
  }

  await reorderRosters(ids, session.user.id)
  return NextResponse.json({ success: true })
}
