import { auth } from "@/lib/auth"
import { sendFriendRequest } from "@/lib/queries"
import { db } from "@/db"
import { friendRequests, friendships, FriendRequestStatus } from "@/db/schema"
import { and, or, eq } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { receiverId } = await req.json()
  if (!receiverId) return NextResponse.json({ error: "receiverId required" }, { status: 400 })
  if (receiverId === session.user.id) return NextResponse.json({ error: "Cannot friend yourself" }, { status: 400 })

  const existingRequest = await db.query.friendRequests.findFirst({
    where: or(
      and(eq(friendRequests.senderId, session.user.id), eq(friendRequests.receiverId, receiverId), eq(friendRequests.status, FriendRequestStatus.Pending)),
      and(eq(friendRequests.senderId, receiverId), eq(friendRequests.receiverId, session.user.id), eq(friendRequests.status, FriendRequestStatus.Pending)),
    ),
  })
  if (existingRequest) return NextResponse.json({ error: "Friend request already pending" }, { status: 409 })

  const existingFriendship = await db.query.friendships.findFirst({
    where: or(
      and(eq(friendships.userId, session.user.id), eq(friendships.friendId, receiverId)),
      and(eq(friendships.userId, receiverId), eq(friendships.friendId, session.user.id)),
    ),
  })
  if (existingFriendship) return NextResponse.json({ error: "Already friends" }, { status: 409 })

  const [request] = await sendFriendRequest(session.user.id, receiverId)
  return NextResponse.json(request, { status: 201 })
}
