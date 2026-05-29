import "dotenv/config"
import { eq, inArray } from "drizzle-orm"
import { db } from "./index"
import { raidDifficulties, raids } from "./schema"

export type RaidSlug =
  | "act-1-aegir"
  | "act-2-brelshaza"
  | "act-3-mordum"
  | "act-4-armoche"
  | "final-act-kazeros"
  | "shadow-raid-serca"

type DifficultyItem = {
  difficulty: string
  minIlvl: number
  loaLogsBossName?: string
  loaLogsDifficulty?: string
}

type RaidDataItem = {
  slug: RaidSlug
  name: string
  difficulties: DifficultyItem[]
}

const raidData: RaidDataItem[] = [
  {
    slug: "act-1-aegir",
    name: "Aegir",
    difficulties: [
      { difficulty: "Solo", minIlvl: 1660 },
      { difficulty: "Normal", minIlvl: 1660 },
      { difficulty: "Hard", minIlvl: 1680 },
    ],
  },
  {
    slug: "act-2-brelshaza",
    name: "Brelshaza",
    difficulties: [
      {
        difficulty: "Solo",
        minIlvl: 1670,
      },
      {
        difficulty: "Normal",
        minIlvl: 1670,
      },
      {
        difficulty: "Hard",
        minIlvl: 1690,
      },
    ],
  },
  {
    slug: "act-3-mordum",
    name: "Mordum",
    difficulties: [
      { difficulty: "Solo", minIlvl: 1680 },
      { difficulty: "Normal", minIlvl: 1680 },
      { difficulty: "Hard", minIlvl: 1700 },
    ],
  },
  {
    slug: "act-4-armoche",
    name: "Armoche",
    difficulties: [
      {
        difficulty: "Normal",
        minIlvl: 1700,
        loaLogsBossName: "Armoche, Sentinel of the Abyss",
        loaLogsDifficulty: "Normal",
      },
      {
        difficulty: "Hard",
        minIlvl: 1720,
        loaLogsBossName: "Armoche, Sentinel of the Abyss",
        loaLogsDifficulty: "Hard",
      },
    ],
  },
  {
    slug: "final-act-kazeros",
    name: "Kazeros",
    difficulties: [
      { difficulty: "Normal", minIlvl: 1710, loaLogsBossName: "Archdemon Kazeros", loaLogsDifficulty: "Normal" },
      { difficulty: "Hard", minIlvl: 1730, loaLogsBossName: "Death Incarnate Kazeros", loaLogsDifficulty: "Hard" },
    ],
  },
  {
    slug: "shadow-raid-serca",
    name: "Serca",
    difficulties: [
      { difficulty: "Normal", minIlvl: 1710, loaLogsBossName: "Corvus Tul Rak", loaLogsDifficulty: "Normal" },
      { difficulty: "Hard", minIlvl: 1730, loaLogsBossName: "Corvus Tul Rak", loaLogsDifficulty: "Hard" },
      {
        difficulty: "Nightmare",
        minIlvl: 1740,
        loaLogsBossName: "Corvus Tul Rak",
        loaLogsDifficulty: "Nightmare",
      },
    ],
  },
]

async function main() {
  console.log("Seeding raids...")

  await db.transaction(async (tx) => {
    for (const raid of raidData) {
      const existing = await tx.query.raids.findFirst({
        where: eq(raids.slug, raid.slug),
        with: { difficulties: true },
      })

      if (existing) {
        const raidUpdates: Partial<typeof raids.$inferInsert> = {}
        if (existing.name !== raid.name) raidUpdates.name = raid.name
        if (Object.keys(raidUpdates).length > 0) {
          await tx.update(raids).set(raidUpdates).where(eq(raids.id, existing.id))
          console.log(`  Updated: ${raid.slug}`)
        }

        const existingDifficultyNames = new Set(existing.difficulties.map((d) => d.difficulty))
        const desiredDifficultyNames = new Set(raid.difficulties.map((d) => d.difficulty))

        const toAdd = raid.difficulties.filter((d) => !existingDifficultyNames.has(d.difficulty))
        const toRemove = existing.difficulties.filter((d) => !desiredDifficultyNames.has(d.difficulty))

        if (toRemove.length > 0) {
          await tx.delete(raidDifficulties).where(
            inArray(
              raidDifficulties.id,
              toRemove.map((d) => d.id),
            ),
          )
          console.log(`  Removed difficulties: ${toRemove.map((d) => d.difficulty).join(", ")}`)
        }

        if (toAdd.length > 0) {
          await tx.insert(raidDifficulties).values(
            toAdd.map((d) => ({
              raidId: existing.id,
              difficulty: d.difficulty,
              minIlvl: d.minIlvl,
              loaLogsBossName: d.loaLogsBossName ?? null,
              loaLogsDifficulty: d.loaLogsDifficulty ?? null,
            })),
          )
          console.log(`  Added difficulties: ${toAdd.map((d) => d.difficulty).join(", ")}`)
        }

        for (const diff of raid.difficulties) {
          const existingDiff = existing.difficulties.find((d) => d.difficulty === diff.difficulty)
          if (existingDiff) {
            const updates: Record<string, string | number | null> = {}
            if (diff.loaLogsBossName !== undefined && existingDiff.loaLogsBossName !== diff.loaLogsBossName)
              updates.loaLogsBossName = diff.loaLogsBossName ?? null
            if (diff.loaLogsDifficulty !== undefined && existingDiff.loaLogsDifficulty !== diff.loaLogsDifficulty)
              updates.loaLogsDifficulty = diff.loaLogsDifficulty ?? null
            if (Object.keys(updates).length > 0) {
              await tx.update(raidDifficulties).set(updates).where(eq(raidDifficulties.id, existingDiff.id))
              console.log(`  Updated difficulty: ${raid.slug} / ${diff.difficulty}`)
            }
          }
        }

        if (toAdd.length === 0 && toRemove.length === 0 && existing.name === raid.name) {
          console.log(`  Up to date: ${raid.slug}`)
        }
      } else {
        const [inserted] = await tx.insert(raids).values({ slug: raid.slug, name: raid.name }).returning()

        if (inserted) {
          await tx.insert(raidDifficulties).values(
            raid.difficulties.map((d) => ({
              raidId: inserted.id,
              difficulty: d.difficulty,
              minIlvl: d.minIlvl,
              loaLogsBossName: d.loaLogsBossName ?? null,
              loaLogsDifficulty: d.loaLogsDifficulty ?? null,
            })),
          )
          console.log(`  Created: ${raid.name} (${raid.difficulties.length} difficulties)`)
        }
      }
    }
  })

  console.log("Seed complete!")
  process.exit(0)
}

main().catch((err) => {
  console.error("Seed failed:", err)
  process.exit(1)
})
