import { NextResponse } from "next/server"
import { GroupRole } from "@/db/schema"
import { auth } from "@/lib/auth"
import { banUser, getGroupMember } from "@/lib/queries"
import { targetUserSchema } from "@/lib/validations"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const caller = await getGroupMember(id, session.user.id)
  if (!caller) return NextResponse.json({ error: "Not a member" }, { status: 403 })
  if (caller.role !== GroupRole.Owner && caller.role !== GroupRole.Admin)
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })

  const body = await req.json()
  const parsed = targetUserSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const target = await getGroupMember(id, parsed.data.userId)
  if (target?.role === GroupRole.Owner)
    return NextResponse.json({ error: "Cannot ban the group owner" }, { status: 400 })

  const ban = await banUser(id, parsed.data.userId)
  return NextResponse.json(ban)
}
