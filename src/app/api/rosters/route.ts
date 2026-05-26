import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { createRoster, getRosters } from "@/lib/queries"
import { createRosterSchema } from "@/lib/validations"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const data = await getRosters(session.user.id)
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = createRosterSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const roster = await createRoster(parsed.data.name, session.user.id)
  return NextResponse.json(roster[0], { status: 201 })
}
