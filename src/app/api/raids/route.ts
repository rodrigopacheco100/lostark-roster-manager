import { auth } from "@/lib/auth"
import { getAllRaids, createRaid, deleteRaid, addRaidDifficulty, removeRaidDifficulty } from "@/lib/queries"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const data = await getAllRaids()
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { name, difficulties } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 })

  const [raid] = await createRaid(name.trim())

  if (Array.isArray(difficulties)) {
    for (const d of difficulties) {
      if (d.difficulty && d.minIlvl) {
        await addRaidDifficulty(raid.id, d.difficulty, d.minIlvl)
      }
    }
  }

  const full = await getAllRaids()
  const created = full.find((r) => r.id === raid.id)
  return NextResponse.json(created, { status: 201 })
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

  await deleteRaid(id)
  return NextResponse.json({ success: true })
}
