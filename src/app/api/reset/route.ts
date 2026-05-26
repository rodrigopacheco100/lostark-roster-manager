import { timingSafeEqual } from "node:crypto"
import { NextResponse } from "next/server"
import { db } from "@/db"
import { characterRaids } from "@/db/schema"
import { env } from "@/lib/env"

function validateApiKey(req: Request): boolean {
  const apiKey = req.headers.get("x-api-key")
  if (!apiKey) return false

  const keyBuffer = Buffer.from(apiKey)
  const storedBuffer = Buffer.from(env.RESET_API_KEY)

  if (keyBuffer.length !== storedBuffer.length) return false

  return timingSafeEqual(keyBuffer, storedBuffer)
}

export async function POST(req: Request) {
  if (!validateApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await db.update(characterRaids).set({ completed: false })

  return NextResponse.json({ success: true })
}
