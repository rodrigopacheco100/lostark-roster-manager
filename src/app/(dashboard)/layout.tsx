import { auth, signOut } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/Sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect("/auth/signin")

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar
        signOutAction={async () => {
          "use server"
          await signOut()
        }}
      />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  )
}
