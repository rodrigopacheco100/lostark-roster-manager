import { auth } from "@/lib/auth"
import { getGroupByInviteCode, joinGroup, getGroupMember, isUserBanned } from "@/lib/queries"
import { joinGroupSchema } from "@/lib/validations"
import { NextResponse } from "next/server"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = joinGroupSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const group = await getGroupByInviteCode(parsed.data.inviteCode)
  if (!group || group.id !== params.id) return NextResponse.json({ error: "Invalid invite code" }, { status: 400 })

  const existing = await getGroupMember(params.id, session.user.id)
  if (existing) return NextResponse.json({ error: "Already a member" }, { status: 409 })

  const banned = await isUserBanned(params.id, session.user.id)
  if (banned) return NextResponse.json({ error: "You are banned from this group" }, { status: 403 })

  const [member] = await joinGroup(params.id, session.user.id)
  return NextResponse.json(member, { status: 200 })
}
