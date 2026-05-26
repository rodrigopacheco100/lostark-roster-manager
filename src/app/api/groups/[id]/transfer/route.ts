import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getGroupMember, getGroupOwner, transferOwnership } from "@/lib/queries"
import { transferOwnershipSchema } from "@/lib/validations"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const owner = await getGroupOwner(id)
  if (!owner || owner.userId !== session.user.id)
    return NextResponse.json({ error: "Only the owner can transfer" }, { status: 403 })

  const body = await req.json()
  const parsed = transferOwnershipSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const target = await getGroupMember(id, parsed.data.targetUserId)
  if (!target) return NextResponse.json({ error: "Target user is not a member" }, { status: 400 })

  await transferOwnership(id, session.user.id, parsed.data.targetUserId)
  return NextResponse.json({ success: true })
}
