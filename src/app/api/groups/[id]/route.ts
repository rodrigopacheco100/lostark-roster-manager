import { NextResponse } from "next/server"
import { GroupRole } from "@/db/schema"
import { auth } from "@/lib/auth"
import { deleteGroup, getGroupDetails, getGroupOwner, updateGroupName } from "@/lib/queries"
import { updateGroupSchema } from "@/lib/validations"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const membership = await getGroupDetails(id, session.user.id)
  if (!membership) return NextResponse.json({ error: "Group not found or you are not a member" }, { status: 404 })

  const group = membership.group
  return NextResponse.json({
    id: group.id,
    name: group.name,
    inviteCode: group.inviteCode,
    createdAt: group.createdAt,
    members: group.members.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      image: m.user.image,
      role: m.role,
      joinedAt: m.joinedAt,
    })),
    bans:
      membership.role === GroupRole.Owner || membership.role === GroupRole.Admin
        ? group.bans.map((b) => ({ id: b.user.id, name: b.user.name, image: b.user.image, bannedAt: b.createdAt }))
        : undefined,
  })
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const owner = await getGroupOwner(id)
  if (!owner || owner.userId !== session.user.id)
    return NextResponse.json({ error: "Only the owner can rename" }, { status: 403 })

  const body = await req.json()
  const parsed = updateGroupSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const [updated] = await updateGroupName(id, session.user.id, parsed.data.name)
  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const owner = await getGroupOwner(id)
  if (!owner || owner.userId !== session.user.id)
    return NextResponse.json({ error: "Only the owner can delete" }, { status: 403 })

  const [deleted] = await deleteGroup(id, session.user.id)
  if (!deleted) return NextResponse.json({ error: "Group not found" }, { status: 404 })
  return NextResponse.json({ success: true })
}
