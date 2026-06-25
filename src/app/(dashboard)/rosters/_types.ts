export type RaidDifficulty = {
  id: string
  difficulty: string
  minIlvl: number
}

export type Raid = {
  id: string
  name: string
  difficulties: RaidDifficulty[]
}

export type CharacterRaid = {
  id: string
  raidDifficulty: RaidDifficulty & { raid: Raid }
}

export type Character = {
  id: string
  name: string
  class: string
  itemLevel: number
  characterGuid?: string | null
  characterRaids: CharacterRaid[]
}

export type Roster = {
  id: string
  name: string
  rosterGuid?: string | null
  characters: Character[]
}
