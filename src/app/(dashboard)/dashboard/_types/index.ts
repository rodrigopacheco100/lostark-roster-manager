export type CharacterRaidData = {
  characterRaidId: string
  raidDifficultyId: string
  raidName: string
  difficulty: string
  minIlvl: number
  completed: boolean
}

export type CharacterData = {
  id: string
  name: string
  class: string
  itemLevel: number
  raids: CharacterRaidData[]
}

export type RosterData = {
  rosterId: string
  rosterName: string
  characters: CharacterData[]
  totalRaidsAssigned: number
  totalCharacters: number
}

export type OwnerInfo = {
  id: string
  name: string
  isMe: boolean
  groups?: string[]
}

export type OwnerRosters = {
  owner: OwnerInfo
  rosters: RosterData[]
}

export type DashboardData = {
  rosters: OwnerRosters[]
  summary: { totalAssigned: number; totalCompleted: number }
}
