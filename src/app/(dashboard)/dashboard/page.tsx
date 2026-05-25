"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Card, Skeleton, PageHeader } from "@/components/ui"
import { OwnerSection } from "./_compose/OwnerSection"
import type { DashboardData } from "./_types"

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url)
  return res.json()
}

export default function DashboardPage() {
  const queryClient = useQueryClient()
  const { data: dashData } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => fetcher<DashboardData>("/api/dashboard"),
    refetchInterval: 60000,
  })

  const myRosters = dashData?.rosters.find((g) => g.owner.isMe)
  const totalRaids = myRosters?.rosters.reduce((s, r) => s + r.totalRaidsAssigned, 0) ?? 0
  const totalCompleted = myRosters?.rosters.reduce(
    (s, r) => s + r.characters.reduce((sc, c) => sc + c.raids.filter((ra) => ra.completed).length, 0),
    0,
  ) ?? 0
  const pct = totalRaids > 0 ? Math.round((totalCompleted / totalRaids) * 100) : 0

  return (
    <div className="space-y-8">
      <div>
        <PageHeader title="Dashboard" />
        <p className="-mt-6 text-sm text-gray-500">Auto-refreshes every 60 seconds</p>
      </div>

      {dashData ? (
        <Card className="overflow-hidden">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">
                Weekly Progress
              </span>
              <span className="text-sm text-gray-400">
                {totalCompleted}/{totalRaids} raids completed
              </span>
            </div>
            <div className="mt-2 h-2.5 w-full rounded-full bg-surface-hover">
              <div
                className="h-2.5 rounded-full bg-blue-500 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <Skeleton width="100%" height="2rem" />
        </Card>
      )}

      <div className="space-y-6">
        {!dashData
          ? Array.from({ length: 2 }).map((_, i) => (
            <div key={i}>
              <Skeleton width="30%" height="1.25rem" className="mb-3" />
              <Card>
                <Skeleton width="60%" height="1rem" className="mb-3" />
                <Skeleton width="100%" height="3rem" />
              </Card>
            </div>
          ))
          : dashData.rosters.map((group) => (
            <OwnerSection
              key={group.owner.id}
              group={group}
              onToggle={() => queryClient.invalidateQueries({ queryKey: ["dashboard"] })}
            />
          ))}
      </div>
    </div>
  )
}
