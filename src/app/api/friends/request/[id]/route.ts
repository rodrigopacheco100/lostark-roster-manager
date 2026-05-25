import { auth } from "@/lib/auth"
import { respondToRequest, createFriendship } from "@/lib/queries"
import { db } from "@/db"
import { friendRequests, FriendRequestStatus } from "@/db/schema"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { action } = await req.json()
  if (action !== FriendRequestStatus.Accepted && action !== FriendRequestStatus.Declined) {
    return NextResponse.json({ error: "action must be 'accepted' or 'declined'" }, { status: 400 })
  }

  if (action === FriendRequestStatus.Accepted) {
    const request = await db.query.friendRequests.findFirst({
      where: eq(friendRequests.id, params.id),
    })
    if (!request || request.receiverId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    await createFriendship(request.senderId, request.receiverId)
    await createFriendship(request.receiverId, request.senderId)
  }

  const [updated] = await respondToRequest(params.id, action)
  return NextResponse.json(updated)
}
