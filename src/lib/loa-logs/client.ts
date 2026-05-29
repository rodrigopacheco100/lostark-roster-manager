import initSqlJs, { type Database as SqlJsDatabase, type SqlJsStatic } from "sql.js"
import { findLoaLogsDifficulty, findRaidSlugByBossName } from "./boss-mappings"
import type { EncounterCheckpoint } from "./file-handle"
import { getCurrentWeeklyWindow } from "./weekly-window"

type EncounterRow = {
  id: number
  current_boss: string
  difficulty: string
  local_player: string
}

type CharacterInfo = {
  id: string
  name: string
}

type RaidDiffInfo = {
  id: string
  difficulty: string
}

type RaidInfo = {
  slug: string
  difficulties: RaidDiffInfo[]
}

let sqlInit: Promise<SqlJsStatic> | null = null

async function getSqlJs() {
  if (!sqlInit) {
    sqlInit = initSqlJs({
      locateFile: (file) => `/sql/${file}`,
    })
  }
  return sqlInit
}

function queryEncounters(db: SqlJsDatabase, startMs: number, endMs: number, lastId: number): EncounterRow[] {
  const stmt = db.prepare(`
    SELECT id, current_boss, difficulty, local_player
    FROM encounter_preview
    WHERE cleared = 1 AND fight_start >= ? AND fight_start < ? AND id > ?
  `)
  stmt.bind([startMs, endMs, lastId])

  const rows: EncounterRow[] = []
  while (stmt.step()) {
    const row = stmt.getAsObject() as EncounterRow
    rows.push(row)
  }
  stmt.free()
  return rows
}

export async function loadEncounters(
  buffer: ArrayBuffer,
  checkpoint?: EncounterCheckpoint | null,
): Promise<{ encounters: EncounterRow[]; checkpointReset: boolean }> {
  const SQL = await getSqlJs()
  const db = new SQL.Database(new Uint8Array(buffer))

  const { startMs, endMs } = getCurrentWeeklyWindow()
  const lastId = checkpoint?.id ?? 0

  let encounters = queryEncounters(db, startMs, endMs, lastId)
  let checkpointReset = false

  if (encounters.length === 0 && checkpoint) {
    const verifyStmt = db.prepare(
      `SELECT id FROM encounter_preview WHERE current_boss = ? AND difficulty = ? AND local_player = ? LIMIT 1`,
    )
    verifyStmt.bind([checkpoint.bossName, checkpoint.difficulty, checkpoint.playerName])
    if (!verifyStmt.step()) {
      encounters = queryEncounters(db, startMs, endMs, 0)
      checkpointReset = true
    }
    verifyStmt.free()
  }

  db.close()
  return { encounters, checkpointReset }
}

export type MatchResult = {
  characterId: string
  raidDifficultyId: string
  completed: true
  bossName: string
  characterName: string
}

export function matchEncounters(
  encounters: EncounterRow[],
  characters: CharacterInfo[],
  raids: RaidInfo[],
): { matches: MatchResult[]; skipped: { bossName: string; reason: string }[] } {
  const matches: MatchResult[] = []
  const skipped: { bossName: string; reason: string }[] = []

  const nameToChars = new Map<string, string[]>()
  for (const char of characters) {
    const key = char.name.trim()
    const existing = nameToChars.get(key) ?? []
    existing.push(char.id)
    nameToChars.set(key, existing)
  }

  const slugToRaid = new Map(raids.map((r) => [r.slug, r]))

  for (const enc of encounters) {
    const playerName = enc.local_player?.trim() ?? ""
    const charIds = playerName ? nameToChars.get(playerName) : undefined

    if (!charIds || charIds.length === 0) {
      skipped.push({ bossName: enc.current_boss, reason: `Character "${enc.local_player}" not found in your rosters` })
      continue
    }

    const raidSlug = findRaidSlugByBossName(enc.current_boss, enc.difficulty)
    if (!raidSlug) {
      skipped.push({ bossName: enc.current_boss, reason: `No mapping for "${enc.current_boss}" / "${enc.difficulty}"` })
      continue
    }

    const raid = slugToRaid.get(raidSlug)
    if (!raid) {
      skipped.push({ bossName: enc.current_boss, reason: `Raid slug "${raidSlug}" not found in the system` })
      continue
    }

    const loaLogsDiff = findLoaLogsDifficulty(enc.current_boss, enc.difficulty)
    const difficulty = raid.difficulties.find(
      (d) => d.difficulty.toLowerCase() === (loaLogsDiff ?? enc.difficulty).toLowerCase(),
    )
    if (!difficulty) {
      skipped.push({
        bossName: enc.current_boss,
        reason: `Difficulty "${enc.difficulty}" not found for raid "${raid.slug}"`,
      })
      continue
    }

    for (const characterId of charIds) {
      matches.push({
        characterId,
        raidDifficultyId: difficulty.id,
        completed: true as const,
        bossName: enc.current_boss,
        characterName: enc.local_player,
      })
    }
  }

  return { matches, skipped }
}
