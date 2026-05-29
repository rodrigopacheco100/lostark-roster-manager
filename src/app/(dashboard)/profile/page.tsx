"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Loader2, Save } from "lucide-react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { z } from "zod"
import { Button, Input, PageHeader } from "@/components/ui"
import { useToast } from "@/hooks/useToast"
import { httpClient } from "@/lib/api"

const imageExtRe = /\.(jpg|jpeg|png|gif|webp|svg|bmp|avif|ico)(\?.*)?$/i
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

function sanitizeUrl(v: string) {
  return v.trim().replace(/ /g, "%20")
}

function isValidImageUrl(v: string) {
  const cleaned = sanitizeUrl(v)
  if (cleaned === "") return false
  try {
    new URL(cleaned)
  } catch {
    return false
  }
  return imageExtRe.test(cleaned)
}

async function validateImageHead(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD" })
    const contentType = res.headers.get("content-type")?.split(";")[0] ?? ""
    return ALLOWED_IMAGE_TYPES.includes(contentType)
  } catch {
    return false
  }
}

const profileSchema = z.object({
  name: z.string().min(1, "Name must be non-empty"),
  image: z
    .string()
    .refine(isValidImageUrl, "Must be a valid image URL ending with .jpg, .png, .gif, .webp, etc")
    .optional(),
})

type User = {
  id: string
  name: string
  email: string
  image: string | null
}

export default function ProfilePage() {
  const queryClient = useQueryClient()
  const { promise, toast } = useToast()

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/user/me"],
    queryFn: () => httpClient.get<User>("/api/user/me"),
  })

  const [name, setName] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [imageReady, setImageReady] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const firstLoad = useRef(true)

  useEffect(() => {
    if (!imageUrl || !isValidImageUrl(imageUrl)) {
      setImageReady(false)
      setImageError(true)
      return
    }

    setImageReady(false)
    setImageError(false)

    const delay = firstLoad.current ? 0 : 500
    firstLoad.current = false

    const timer = setTimeout(() => {
      validateImageHead(sanitizeUrl(imageUrl)).then((valid) => {
        setImageReady(valid)
        setImageError(!valid)
      })
    }, delay)

    return () => clearTimeout(timer)
  }, [imageUrl])

  if (user && !initialized) {
    setName(user.name)
    setImageUrl(user.image ?? "")
    setInitialized(true)
  }

  const saveMutation = useMutation({
    mutationFn: (data: { name?: string; image?: string | null }) => httpClient.put<User>("/api/user/me", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/me"] })
    },
  })

  async function handleSave() {
    const parsed = profileSchema.safeParse({ name: name.trim(), image: imageUrl })
    if (!parsed.success) {
      toast(parsed.error.issues.map((i) => i.message).join(", "), "error")
      return
    }

    const updates: { name?: string; image?: string | null } = {}
    if (parsed.data.name !== user?.name) updates.name = parsed.data.name
    if (imageUrl !== (user?.image ?? "")) updates.image = sanitizeUrl(imageUrl) || null

    if (Object.keys(updates).length === 0) return

    await promise(saveMutation.mutateAsync(updates), {
      loading: "Saving profile...",
      success: "Profile updated!",
      error: (err: Error) => err.message,
    })
  }

  const hasChanges = name.trim() !== (user?.name ?? "") || imageUrl !== (user?.image ?? "")

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Profile" />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Profile" />
      <div className="space-y-6 max-w-xl">
        <div className="rounded-xl border border-gray-800 bg-surface-elevated p-6">
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-gray-400">Avatar</h2>
          <div className="flex items-start gap-6">
            <div className="shrink-0">
              {imageReady && imageUrl ? (
                <Image
                  src={sanitizeUrl(imageUrl)}
                  alt="Avatar"
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-full ring-2 ring-surface-hover object-cover"
                  unoptimized
                  onError={() => setImageError(true)}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-surface-hover ring-2 ring-surface-hover">
                  <span className="text-4xl font-bold text-gray-500">
                    {(name || user?.name || "?")[0].toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 space-y-3">
              <Input
                label="Avatar URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
              />
              {imageError && <p className="text-xs text-danger">Failed to load image</p>}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-800 bg-surface-elevated p-6">
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-gray-400">Display Name</h2>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your display name" />
        </div>

        <div className="rounded-xl border border-gray-800 bg-surface-elevated p-6">
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-gray-400">Email</h2>
          <p className="text-gray-300">{user?.email}</p>
        </div>

        <Button
          onClick={handleSave}
          disabled={!hasChanges || saveMutation.isPending || !name.trim()}
          icon={<Save className="h-4 w-4" />}
        >
          {saveMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}
