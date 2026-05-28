import { Suspense } from "react"
import { AuthGuard } from "@/components/AuthGuard"
import { Sidebar } from "@/components/Sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <AuthGuard>
        <div className="flex h-screen overflow-hidden bg-surface">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-8">{children}</main>
        </div>
      </AuthGuard>
    </Suspense>
  )
}
