import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

export default async function Home() {
  const session = await auth()
  if (session?.user) redirect("/dashboard")

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">Lost Ark Roster Manager</h1>
      <p className="text-lg text-gray-600 mb-8">Track raid progress across your rosters and friends</p>
      <Link href="/auth/signin" className="rounded bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700">
        Sign in with Google
      </Link>
    </main>
  )
}
