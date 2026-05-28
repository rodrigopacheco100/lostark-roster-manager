import { Suspense } from "react"
import { JoinGroupContent } from "./JoinGroupContent"

export const dynamic = "force-dynamic"

export default function JoinGroupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      }
    >
      <JoinGroupContent />
    </Suspense>
  )
}
