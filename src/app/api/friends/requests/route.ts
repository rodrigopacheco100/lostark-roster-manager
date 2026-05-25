import { auth } from "@/lib/auth"
import { getFriendRequests } from "@/lib/queries"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const requests = await getFriendRequests(session.user.id)
  return NextResponse.json(requests)
}
