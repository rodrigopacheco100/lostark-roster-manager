import { NextResponse } from "next/server"
import { GroupRole } from "@/db/schema"
import { auth } from "@/lib/auth"
import { changeMemberRole, getGroupMember, getGroupOwner } from "@/lib/queries"
import { changeRoleSchema } from "@/lib/validations"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string; userId: string }> }) {
  const { id, userId } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const owner = await getGroupOwner(id)
  if (!owner || owner.userId !== session.user.id)
    return NextResponse.json({ error: "Only the owner can change roles" }, { status: 403 })

  const body = await req.json()
  const parsed = changeRoleSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const target = await getGroupMember(id, userId)
  if (!target) return NextResponse.json({ error: "User is not a member" }, { status: 400 })
  if (target.role === GroupRole.Owner)
    return NextResponse.json({ error: "Cannot change owner's role, use transfer" }, { status: 400 })

  await changeMemberRole(id, userId, parsed.data.role as GroupRole)
  return NextResponse.json({ success: true })
}
