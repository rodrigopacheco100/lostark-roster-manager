import { auth } from "@/lib/auth"
import { getGroupMember, kickMember, getGroupOwner } from "@/lib/queries"
import { targetUserSchema } from "@/lib/validations"
import { GroupRole } from "@/db/schema"
import { NextResponse } from "next/server"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const caller = await getGroupMember(params.id, session.user.id)
  if (!caller) return NextResponse.json({ error: "Not a member" }, { status: 403 })
  if (caller.role !== GroupRole.Owner && caller.role !== GroupRole.Admin) return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })

  const body = await req.json()
  const parsed = targetUserSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const target = await getGroupMember(params.id, parsed.data.userId)
  if (!target) return NextResponse.json({ error: "User is not a member" }, { status: 400 })
  if (target.role === GroupRole.Owner) return NextResponse.json({ error: "Cannot kick the group owner" }, { status: 400 })

  await kickMember(params.id, parsed.data.userId)
  return NextResponse.json({ success: true })
}
