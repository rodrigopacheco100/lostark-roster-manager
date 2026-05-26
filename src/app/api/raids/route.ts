import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getAllRaids } from "@/lib/queries"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const data = await getAllRaids()
  return NextResponse.json(data)
}
