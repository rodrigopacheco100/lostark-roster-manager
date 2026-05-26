import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { db } from "@/db"
import { users } from "@/db/schema"
import { auth } from "@/lib/auth"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")
  if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 })

  const user = await db.query.users.findFirst({
    where: eq(users.friendCode, code),
  })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
  if (user.id === session.user.id) return NextResponse.json({ error: "Cannot add yourself" }, { status: 400 })

  return NextResponse.json(user)
}
