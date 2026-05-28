import { env } from "@/lib/env"
import type { AGSLostArkClass } from "./ags-class-map"

const BASE_URL = "https://api.ags.lol/api/v1/mirth"

export interface AGSCombatPower {
  id: number
  score: number
}

export interface AGSCharacter {
  guid: string
  name: string
  region: string
  world: string
  last_update_timestamp: number
  class: AGSLostArkClass
  item_level: number
  combat_power: AGSCombatPower
  max_combat_power: AGSCombatPower
  estimated_max_combat_power: number | null
  roster_guid: string
}

export interface AGSRoster {
  guid: string
  region: string
  world: string
  characters: AGSCharacter[]
}

async function agsFetch<T>(path: string): Promise<T> {
  if (!env.AGS_API_KEY) {
    throw new Error("AGS_API_KEY is not configured")
  }
  const url = `${BASE_URL}${path}`
  const res = await fetch(url, {
    headers: { "x-api-key": env.AGS_API_KEY },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(text || `AGS API returned ${res.status}`)
  }
  return res.json() as Promise<T>
}

export async function getCharacterByName(region: string, name: string): Promise<AGSCharacter> {
  return agsFetch<AGSCharacter>(`/characters/by-name/${encodeURIComponent(region)}/${encodeURIComponent(name)}`)
}

export async function getRosterByGuid(guid: string): Promise<AGSRoster> {
  return agsFetch<AGSRoster>(`/rosters/by-guid/${encodeURIComponent(guid)}`)
}
