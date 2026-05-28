import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/db"
import { users } from "@/db/schema"
import { auth } from "@/lib/auth"

const imageExtRe = /\.(jpg|jpeg|png|gif|webp|svg|bmp|avif|ico)(\?.*)?$/i

function isValidImageUrl(v: string) {
  if (v === "") return true
  try {
    new URL(v)
  } catch {
    return false
  }
  return imageExtRe.test(v)
}

const updateSchema = z.object({
  name: z.string().min(1, "Name must be non-empty").optional(),
  image: z
    .string()
    .refine(isValidImageUrl, "Must be a valid image URL ending with .jpg, .png, .gif, .webp, etc")
    .optional()
    .nullable()
    .transform((v) => (v === "" ? null : v)),
})

async function getSessionUser() {
  const session = await auth()
  if (!session?.user?.id) return null
  return session.user.id
}

export async function GET() {
  const userId = await getSessionUser()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  })
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json(user)
}

export async function PUT(request: Request) {
  const userId = await getSessionUser()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const parsed = updateSchema.safeParse(body)

  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join(", ")
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const { name, image } = parsed.data

  const updates: Record<string, string | null> = {}
  if (name !== undefined) updates.name = name.trim()
  if (image !== undefined) updates.image = image

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 })
  }

  await db.update(users).set(updates).where(eq(users.id, userId))

  const updated = await db.query.users.findFirst({
    where: eq(users.id, userId),
  })

  return NextResponse.json(updated)
}
