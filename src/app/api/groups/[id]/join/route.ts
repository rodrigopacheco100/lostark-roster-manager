import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getGroupByInviteCode, getGroupMember, isUserBanned, joinGroup } from "@/lib/queries"
import { joinGroupSchema } from "@/lib/validations"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = joinGroupSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const group = await getGroupByInviteCode(parsed.data.inviteCode)
  if (!group || group.id !== id) return NextResponse.json({ error: "Invalid invite code" }, { status: 400 })

  const existing = await getGroupMember(id, session.user.id)
  if (existing) return NextResponse.json({ error: "Already a member" }, { status: 409 })

  const banned = await isUserBanned(id, session.user.id)
  if (banned) return NextResponse.json({ error: "You are banned from this group" }, { status: 403 })

  const [member] = await joinGroup(id, session.user.id)
  return NextResponse.json(member, { status: 200 })
}
