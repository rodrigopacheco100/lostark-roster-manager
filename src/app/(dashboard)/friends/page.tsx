"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, Button, Input, PageHeader, EmptyState, Modal } from "@/components/ui"
import { useConfirm } from "@/hooks/useConfirm"
import { useToast } from "@/hooks/useToast"
import { Users, UserPlus, Check, X, UserMinus, UserRoundPlus, Copy } from "lucide-react"
import { http } from "@/lib/api"

type User = {
  id: string
  name: string
  email: string
  image: string | null
  friendCode: string
}

type FriendRequest = {
  id: string
  senderId: string
  receiverId: string
  status: string
  sender: User
  receiver: User
}

export default function FriendsPage() {
  const queryClient = useQueryClient()
  const { data: friends } = useQuery<User[]>({
    queryKey: ["/api/friends"],
    queryFn: () => http.get<User[]>("/api/friends"),
  })
  const { data: requests } = useQuery<FriendRequest[]>({
    queryKey: ["/api/friends/requests"],
    queryFn: () => http.get<FriendRequest[]>("/api/friends/requests"),
  })
  const { data: currentUser } = useQuery<User>({
    queryKey: ["/api/user/me"],
    queryFn: () => http.get<User>("/api/user/me"),
  })
  const { confirm } = useConfirm()
  const { toast, promise } = useToast()

  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [searching, setSearching] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [friendCodeInput, setFriendCodeInput] = useState("")
  const [addError, setAddError] = useState("")
  const [addSuccess, setAddSuccess] = useState("")
  const [copied, setCopied] = useState(false)

  const sendRequestMutation = useMutation({
    mutationFn: (receiverId: string) =>
      http.post("/api/friends/request", { receiverId }),
  })

  const respondMutation = useMutation({
    mutationFn: ({ requestId, action }: { requestId: string; action: "accepted" | "declined" }) =>
      http.put(`/api/friends/request/${requestId}`, { action }),
  })

  const removeFriendMutation = useMutation({
    mutationFn: (friendId: string) =>
      http.delete("/api/friends", { friendId }),
  })

  async function handleSearch(q: string) {
    setSearchQuery(q)
    if (q.length < 2) {
      setSearchResults([])
      return
    }
    setSearching(true)
    try {
      const data = await http.get<User[]>(`/api/friends/search?q=${encodeURIComponent(q)}`)
      setSearchResults(data)
    } catch {
      setSearchResults([])
    }
    setSearching(false)
  }

  async function handleSendRequest(receiverId: string, onDone?: () => void) {
    await promise(
      sendRequestMutation.mutateAsync(receiverId),
      {
        loading: "Sending request...",
        success: "Friend request sent!",
        error: (err: Error) => err.message,
      },
    )
    setSearchQuery("")
    setSearchResults([])
    queryClient.invalidateQueries({ queryKey: ["/api/friends/requests"] })
    onDone?.()
  }

  async function handleAddByCode() {
    setAddError("")
    setAddSuccess("")
    if (!friendCodeInput.trim()) return

    try {
      const user = await http.get<User>(`/api/friends/by-code?code=${encodeURIComponent(friendCodeInput.trim())}`)
      handleSendRequest(user.id, () => {
        setAddSuccess(`Friend request sent to ${user.name}!`)
        setFriendCodeInput("")
      })
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "User not found")
    }
  }

  async function handleCopyCode() {
    if (currentUser?.friendCode) {
      await navigator.clipboard.writeText(currentUser.friendCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  async function handleRespond(requestId: string, action: "accepted" | "declined") {
    await promise(
      respondMutation.mutateAsync({ requestId, action }),
      { loading: action === "accepted" ? "Accepting..." : "Declining...", success: action === "accepted" ? "Request accepted!" : "Request declined", error: (err: Error) => err.message },
    )
    queryClient.invalidateQueries({ queryKey: ["/api/friends/requests"] })
    queryClient.invalidateQueries({ queryKey: ["/api/friends"] })
  }

  async function handleRemoveFriend(friendId: string) {
    const ok = await confirm({
      title: "Remove friend",
      message: "Are you sure you want to remove this friend?",
      confirmLabel: "Remove",
      cancelLabel: "Cancel",
    })
    if (!ok) return
    await promise(
      removeFriendMutation.mutateAsync(friendId),
      {
        loading: "Removing...",
        success: "Friend removed",
        error: "Failed to remove friend",
      },
    )
    queryClient.invalidateQueries({ queryKey: ["/api/friends"] })
  }

  const pendingRequests = requests?.filter((r) => r.status === "pending") ?? []

  return (
    <div>
      <PageHeader
        title="Friends"
        action={
          <Button onClick={() => setAddModalOpen(true)} icon={<UserRoundPlus className="h-4 w-4" />}>
            Add Friend
          </Button>
        }
      />

      <Modal isOpen={addModalOpen} onClose={() => { setAddModalOpen(false); setAddError(""); setAddSuccess(""); setFriendCodeInput("") }} title="Add Friend">
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium text-gray-400">Your Friend Code</p>
            <div className="flex items-center gap-2 rounded-lg bg-surface-hover px-4 py-3">
              <code className="flex-1 font-mono text-lg font-bold text-blue-400">
                {currentUser?.friendCode ?? "---"}
              </code>
              <Button variant="ghost" size="sm" onClick={handleCopyCode} icon={<Copy className="h-4 w-4" />}>
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-gray-700" />
            <span className="text-xs font-medium text-gray-500">OR</span>
            <div className="h-px flex-1 bg-gray-700" />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-gray-400">Add by Friend Code</p>
            <div className="flex gap-2">
              <Input
                value={friendCodeInput}
                onChange={(e) => setFriendCodeInput(e.target.value)}
                placeholder="Enter friend code..."
                className="flex-1"
              />
              <Button onClick={handleAddByCode} icon={<UserPlus className="h-4 w-4" />}>
                Send
              </Button>
            </div>
            {addError && <p className="mt-1 text-xs text-danger">{addError}</p>}
            {addSuccess && <p className="mt-1 text-xs text-green-400">{addSuccess}</p>}
          </div>
        </div>
      </Modal>

      <div className="mb-8">
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search users by name, email, or friend code..."
        />
        {searching && <p className="mt-1 text-sm text-gray-500">Searching...</p>}
        {searchResults.length > 0 && (
          <Card className="mt-2 divide-y divide-gray-700">
            {searchResults.map((user) => (
              <div key={user.id} className="flex items-center justify-between px-0 py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  {user.image && (
                    <img src={user.image} alt="" className="h-8 w-8 rounded-full" />
                  )}
                  <div>
                    <p className="font-medium text-gray-200">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    {user.friendCode && <p className="text-xs text-gray-600">{user.friendCode}</p>}
                  </div>
                </div>
                <Button size="sm" onClick={() => handleSendRequest(user.id)} icon={<UserPlus className="h-4 w-4" />}>
                  Add Friend
                </Button>
              </div>
            ))}
          </Card>
        )}
      </div>

      {pendingRequests.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-gray-200">Pending Requests</h2>
          <div className="space-y-2">
            {pendingRequests.map((req) => {
              const isSentByMe = req.sender.id === currentUser?.id
              return (
                <Card key={req.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isSentByMe
                      ? req.receiver.image && <img src={req.receiver.image} alt="" className="h-8 w-8 rounded-full" />
                      : req.sender.image && <img src={req.sender.image} alt="" className="h-8 w-8 rounded-full" />
                    }
                    <div>
                      <p className="font-medium text-gray-200">
                        {isSentByMe ? req.receiver.name : req.sender.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {isSentByMe ? "Friend request sent" : "wants to be your friend"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {isSentByMe ? (
                      <Button size="sm" variant="ghost" onClick={() => handleRespond(req.id, "declined")} icon={<X className="h-4 w-4" />}>
                        Cancel
                      </Button>
                    ) : (
                      <>
                        <Button size="sm" variant="primary" onClick={() => handleRespond(req.id, "accepted")} icon={<Check className="h-4 w-4" />}>
                          Accept
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleRespond(req.id, "declined")} icon={<X className="h-4 w-4" />}>
                          Decline
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-200">Your Friends ({friends?.length ?? 0})</h2>
        {friends?.length === 0 ? (
          <EmptyState
            icon={<Users className="h-12 w-12" />}
            title="No friends yet"
            description="Click the Add Friend button above to find friends by name, email, or friend code."
          />
        ) : (
          <div className="space-y-2">
            {friends?.map((friend) => (
              <Card key={friend.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {friend.image && (
                    <img src={friend.image} alt="" className="h-8 w-8 rounded-full" />
                  )}
                  <div>
                    <p className="font-medium text-gray-200">{friend.name}</p>
                    <p className="text-sm text-gray-500">{friend.email}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleRemoveFriend(friend.id)} icon={<UserMinus className="h-4 w-4 text-danger" />}>
                  Remove
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
