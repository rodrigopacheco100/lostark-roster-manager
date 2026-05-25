import { auth } from "@/lib/auth"
import { searchUsers } from "@/lib/queries"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")
  if (!q || q.length < 2) return NextResponse.json([])

  const results = await searchUsers(q, session.user.id)
  return NextResponse.json(results)
}
