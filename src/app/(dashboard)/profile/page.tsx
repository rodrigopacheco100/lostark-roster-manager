import { eq } from "drizzle-orm"
import Image from "next/image"
import { redirect } from "next/navigation"
import { Card, PageHeader } from "@/components/ui"
import { db } from "@/db"
import { users } from "@/db/schema"
import { auth } from "@/lib/auth"

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/signin")

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  })

  return (
    <div>
      <PageHeader title="Profile" />
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          {session.user.image && (
            <Image
              src={session.user.image}
              alt="Avatar"
              width={64}
              height={64}
              className="h-16 w-16 rounded-full ring-2 ring-surface-hover"
              unoptimized
            />
          )}
          <div>
            <p className="text-lg font-medium text-gray-100">{session.user.name}</p>
            <p className="text-gray-500">{session.user.email}</p>
          </div>
        </div>

        {user?.friendCode && (
          <Card className="inline-flex flex-col gap-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Friend Code</p>
            <p className="font-mono text-2xl font-bold text-blue-400">{user.friendCode}</p>
          </Card>
        )}
      </div>
    </div>
  )
}
