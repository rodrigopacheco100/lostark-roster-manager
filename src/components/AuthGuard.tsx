"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { useEffect } from "react"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useSession()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      const currentPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "")
      router.replace(`/auth/signin?callbackUrl=${encodeURIComponent(currentPath)}`)
    }
  }, [status, pathname, searchParams, router])

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex h-screen items-center justify-center bg-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-500 border-t-transparent" />
      </div>
    )
  }

  return <>{children}</>
}
