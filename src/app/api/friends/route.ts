import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getFriendships, removeFriendship } from "@/lib/queries"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const friendships = await getFriendships(session.user.id)
  const friends = friendships.map((f) => f.friend)
  return NextResponse.json(friends)
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id

  const { friendId } = await req.json()
  await removeFriendship(userId, friendId)
  await removeFriendship(friendId, userId)
  return NextResponse.json({ success: true })
}
