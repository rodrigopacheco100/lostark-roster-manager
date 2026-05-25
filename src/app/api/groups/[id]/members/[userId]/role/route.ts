import { auth } from "@/lib/auth"
import { getGroupOwner, changeMemberRole, getGroupMember } from "@/lib/queries"
import { changeRoleSchema } from "@/lib/validations"
import { GroupRole } from "@/db/schema"
import { NextResponse } from "next/server"

export async function PUT(req: Request, { params }: { params: { id: string; userId: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const owner = await getGroupOwner(params.id)
  if (!owner || owner.userId !== session.user.id) return NextResponse.json({ error: "Only the owner can change roles" }, { status: 403 })

  const body = await req.json()
  const parsed = changeRoleSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const target = await getGroupMember(params.id, params.userId)
  if (!target) return NextResponse.json({ error: "User is not a member" }, { status: 400 })
  if (target.role === GroupRole.Owner) return NextResponse.json({ error: "Cannot change owner's role, use transfer" }, { status: 400 })

  await changeMemberRole(params.id, params.userId, parsed.data.role as GroupRole)
  return NextResponse.json({ success: true })
}
