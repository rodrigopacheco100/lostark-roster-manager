"use client"

import useSWR from "swr"
import { Card, Badge, Skeleton, Button, PageHeader } from "@/components/ui"
import { Swords, Users } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type CharacterRaidSummary = {
  raidName: string
  difficulty: string
  minIlvl: number
}

type CharacterSummary = {
  id: string
  name: string
  class: string
  itemLevel: number
  raids: CharacterRaidSummary[]
}

type RosterSummary = {
  rosterId: string
  rosterName: string
  characters: CharacterSummary[]
  totalRaidsAssigned: number
  totalCharacters: number
}

type DashboardData = {
  rosters: RosterSummary[]
}

export default function DashboardPage() {
  const { data: dashData } = useSWR<DashboardData>("/api/dashboard", fetcher, {
    refreshInterval: 60000,
  })

  const totalRaids = dashData?.rosters.reduce((s, r) => s + r.totalRaidsAssigned, 0) ?? 0
  const totalChars = dashData?.rosters.reduce((s, r) => s + r.totalCharacters, 0) ?? 0

  return (
    <div className="space-y-8">
      <div>
        <PageHeader title="Dashboard" />
        <p className="-mt-6 text-sm text-gray-500">Auto-refreshes every 60 seconds</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="text-center">
          {dashData ? (
            <>
              <p className="text-3xl font-bold text-blue-400">{totalRaids}</p>
              <p className="text-sm text-gray-500">Raids Assigned</p>
            </>
          ) : (
            <div className="space-y-2 py-2">
              <Skeleton width="3rem" height="2rem" className="mx-auto" />
              <Skeleton width="6rem" height="0.75rem" className="mx-auto" />
            </div>
          )}
        </Card>
        <Card className="text-center">
          {dashData ? (
            <>
              <p className="text-3xl font-bold text-green-400">{totalChars}</p>
              <p className="text-sm text-gray-500">Characters</p>
            </>
          ) : (
            <div className="space-y-2 py-2">
              <Skeleton width="3rem" height="2rem" className="mx-auto" />
              <Skeleton width="6rem" height="0.75rem" className="mx-auto" />
            </div>
          )}
        </Card>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-100">My Rosters</h2>
        <div className="space-y-4">
          {!dashData
            ? Array.from({ length: 2 }).map((_, i) => (
                <Card key={i}>
                  <Skeleton width="60%" height="1.25rem" className="mb-3" />
                  <Skeleton width="100%" height="3rem" />
                </Card>
              ))
            : dashData.rosters.map((roster) => (
                <Card key={roster.rosterId}>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-medium text-gray-100">{roster.rosterName}</h3>
                    <span className="text-sm text-gray-500">
                      {roster.totalCharacters} chars · {roster.totalRaidsAssigned} raids
                    </span>
                  </div>
                  <div className="space-y-2">
                    {roster.characters.map((char) => (
                      <div key={char.id} className="rounded-lg bg-surface-hover p-3 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-200">{char.name}</span>
                          <Badge color="gray">{char.class}</Badge>
                          <span className="text-gray-500">IL {char.itemLevel}</span>
                        </div>
                        {char.raids.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            <Swords className="mr-1 h-3.5 w-3.5 text-gray-500" />
                            {char.raids.map((r, i) => (
                              <Badge key={i} color="blue">
                                {r.raidName} ({r.difficulty})
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
        </div>
      </div>
    </div>
  )
}
