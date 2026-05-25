import { auth } from "@/lib/auth"
import { getGroupMember, leaveGroup } from "@/lib/queries"
import { GroupRole } from "@/db/schema"
import { NextResponse } from "next/server"

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const member = await getGroupMember(params.id, session.user.id)
  if (!member) return NextResponse.json({ error: "Not a member" }, { status: 403 })
  if (member.role === GroupRole.Owner) return NextResponse.json({ error: "Owner must transfer ownership before leaving" }, { status: 400 })

  await leaveGroup(params.id, session.user.id)
  return NextResponse.json({ success: true })
}
