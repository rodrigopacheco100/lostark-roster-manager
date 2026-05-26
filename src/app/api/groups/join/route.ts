import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getGroupByInviteCode } from "@/lib/queries"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")
  if (!code) return NextResponse.json({ error: "Invalid invite code" }, { status: 400 })

  const group = await getGroupByInviteCode(code)
  if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 })

  return NextResponse.json({
    id: group.id,
    name: group.name,
    memberCount: group.members.length,
  })
}
