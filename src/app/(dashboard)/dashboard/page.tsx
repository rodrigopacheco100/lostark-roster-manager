"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, Skeleton } from "@/components/ui"
import { isTogglingRef, useRaidToggleQueue } from "@/hooks/useRaidToggleQueue"
import { httpClient } from "@/lib/api"
import { OwnerSection } from "./_compose/OwnerSection"
import type { DashboardData } from "./_types"

export default function DashboardPage() {
  const { enqueue } = useRaidToggleQueue()
  const { data: dashData } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => httpClient.get<DashboardData>("/api/dashboard"),
    staleTime: 5_000,
    refetchInterval: () => (isTogglingRef.current ? false : 20_000),
  })

  return (
    <div className="space-y-6">
      {!dashData
        ? [0, 1].map((n) => (
            <div key={`skeleton-${n}`}>
              <Skeleton width="30%" height="1.25rem" className="mb-3" />
              <Card>
                <Skeleton width="60%" height="1rem" className="mb-3" />
                <Skeleton width="100%" height="3rem" />
              </Card>
            </div>
          ))
        : dashData.rosters.map((group) => <OwnerSection key={group.owner.id} group={group} enqueue={enqueue} />)}
    </div>
  )
}
