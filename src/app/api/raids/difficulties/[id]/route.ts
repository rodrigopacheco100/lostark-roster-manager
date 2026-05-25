import { auth } from "@/lib/auth"
import { removeRaidDifficulty } from "@/lib/queries"
import { NextResponse } from "next/server"

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await removeRaidDifficulty(params.id)
  return NextResponse.json({ success: true })
}
