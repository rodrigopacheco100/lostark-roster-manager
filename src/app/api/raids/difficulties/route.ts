import { auth } from "@/lib/auth"
import { addRaidDifficulty } from "@/lib/queries"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { raidId, difficulty, minIlvl } = await req.json()
  if (!raidId || !difficulty || !minIlvl) {
    return NextResponse.json({ error: "raidId, difficulty, and minIlvl required" }, { status: 400 })
  }

  const [result] = await addRaidDifficulty(raidId, difficulty, minIlvl)
  return NextResponse.json(result, { status: 201 })
}
