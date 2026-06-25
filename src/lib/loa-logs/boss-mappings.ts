import type { RaidSlug } from "@/db/seed"

type BossMapping = {
  bossName: string
  loaLogsDifficulty: string
  slug: RaidSlug
}

const bossMappings: BossMapping[] = [
  // Armoche
  { bossName: "Armoche, Sentinel of the Abyss", loaLogsDifficulty: "Normal", slug: "act-4-armoche" },
  { bossName: "Armoche, Sentinel of the Abyss", loaLogsDifficulty: "Hard", slug: "act-4-armoche" },
  // Kazeros
  { bossName: "Archdemon Kazeros", loaLogsDifficulty: "Normal", slug: "final-act-kazeros" },
  { bossName: "Death Incarnate Kazeros", loaLogsDifficulty: "Hard", slug: "final-act-kazeros" },
  // Serca
  { bossName: "Corvus Tul Rak", loaLogsDifficulty: "Normal", slug: "shadow-raid-serca" },
  { bossName: "Corvus Tul Rak", loaLogsDifficulty: "Hard", slug: "shadow-raid-serca" },
  { bossName: "Corvus Tul Rak", loaLogsDifficulty: "Nightmare", slug: "shadow-raid-serca" },
  // Horizon Cathedral
  {
    bossName: "Arcenos, Vanguard of Fanaticism",
    loaLogsDifficulty: "Level 1",
    slug: "abyssal-dungeon-horizon-cathedral",
  },
  {
    bossName: "Arcenos, Vanguard of Fanaticism",
    loaLogsDifficulty: "Level 2",
    slug: "abyssal-dungeon-horizon-cathedral",
  },
  {
    bossName: "Arcenos, Vanguard of Fanaticism",
    loaLogsDifficulty: "Level 3",
    slug: "abyssal-dungeon-horizon-cathedral",
  },
]

export function findRaidSlugByBossName(bossName: string, difficulty?: string): RaidSlug | undefined {
  if (difficulty) {
    const match = bossMappings.find(
      (m) => m.bossName === bossName && m.loaLogsDifficulty.toLowerCase() === difficulty.toLowerCase(),
    )
    if (match) return match.slug
  }
  const fallback = bossMappings.find((m) => m.bossName === bossName)
  return fallback?.slug
}

export function findLoaLogsDifficulty(bossName: string, difficulty: string): string | undefined {
  const match = bossMappings.find(
    (m) => m.bossName === bossName && m.loaLogsDifficulty.toLowerCase() === difficulty.toLowerCase(),
  )
  return match?.loaLogsDifficulty
}
