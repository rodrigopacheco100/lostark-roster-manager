import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/db"
import { users } from "@/db/schema"
import { auth } from "@/lib/auth"

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/bmp",
  "image/avif",
  "image/x-icon",
  "image/vnd.microsoft.icon",
]
const imageExtRe = /\.(jpg|jpeg|png|gif|webp|svg|bmp|avif|ico)(\?.*)?$/i

function sanitizeUrl(v: string) {
  return v.trim().replace(/ /g, "%20")
}

function isValidUrl(v: string) {
  const cleaned = sanitizeUrl(v)
  if (cleaned === "") return false
  try {
    new URL(cleaned)
    return true
  } catch {
    return false
  }
}

async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const res = await fetch(sanitizeUrl(url), { method: "HEAD" })
    const contentType = res.headers.get("content-type")?.split(";")[0] ?? ""
    return ALLOWED_IMAGE_TYPES.includes(contentType)
  } catch {
    return false
  }
}

const updateSchema = z.object({
  name: z.string().min(1, "Name must be non-empty").optional(),
  image: z
    .string()
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

  if (image !== undefined && image !== null) {
    const cleaned = sanitizeUrl(image)
    if (!isValidUrl(cleaned)) {
      return NextResponse.json({ error: "Invalid image URL format" }, { status: 400 })
    }
    if (!imageExtRe.test(cleaned)) {
      return NextResponse.json(
        { error: "URL must end with a valid image extension (jpg, jpeg, png, gif, webp, svg, bmp, avif, ico)" },
        { status: 400 },
      )
    }
    const isValidImage = await validateImageUrl(cleaned)
    if (!isValidImage) {
      return NextResponse.json({ error: "URL must point to a valid image" }, { status: 400 })
    }
  }

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
