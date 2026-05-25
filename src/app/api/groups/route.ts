import { auth } from "@/lib/auth"
import { getUserGroups, createGroup } from "@/lib/queries"
import { createGroupSchema } from "@/lib/validations"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const memberships = await getUserGroups(session.user.id)
  const groups = memberships.map((m) => ({
    id: m.group.id,
    name: m.group.name,
    inviteCode: m.group.inviteCode,
    role: m.role,
    memberCount: m.group.members.length,
  }))
  return NextResponse.json(groups)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = createGroupSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const group = await createGroup(parsed.data.name, session.user.id)
  return NextResponse.json(group, { status: 201 })
}
