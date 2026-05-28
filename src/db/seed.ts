import "dotenv/config"
import { eq, inArray } from "drizzle-orm"
import { db } from "./index"
import { raidDifficulties, raids } from "./schema"

type RaidDataItem = {
  slug: string
  name: string
  difficulties: {
    difficulty: string
    minIlvl: number
  }[]
}

const raidData: RaidDataItem[] = [
  {
    slug: "act-1-aegir",
    name: "Aegir",
    difficulties: [
      { difficulty: "Normal", minIlvl: 1660 },
      { difficulty: "Hard", minIlvl: 1680 },
    ],
  },
  {
    slug: "act-2-brelshaza",
    name: "Brelshaza",
    difficulties: [
      { difficulty: "Normal", minIlvl: 1670 },
      { difficulty: "Hard", minIlvl: 1690 },
    ],
  },
  {
    slug: "act-3-mordum",
    name: "Mordum",
    difficulties: [
      { difficulty: "Normal", minIlvl: 1680 },
      { difficulty: "Hard", minIlvl: 1700 },
    ],
  },
  {
    slug: "act-4-armoche",
    name: "Armoche",
    difficulties: [
      { difficulty: "Normal", minIlvl: 1700 },
      { difficulty: "Hard", minIlvl: 1720 },
    ],
  },
  {
    slug: "final-act-kazeros",
    name: "Kazeros",
    difficulties: [
      { difficulty: "Normal", minIlvl: 1710 },
      { difficulty: "Hard", minIlvl: 1730 },
    ],
  },
  {
    slug: "shadow-raid-serca",
    name: "Serca",
    difficulties: [
      { difficulty: "Normal", minIlvl: 1710 },
      { difficulty: "Hard", minIlvl: 1730 },
      { difficulty: "Nightmare", minIlvl: 1740 },
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
        if (existing.name !== raid.name) {
          await tx.update(raids).set({ name: raid.name }).where(eq(raids.id, existing.id))
          console.log(`  Updated name: ${raid.slug} → "${raid.name}"`)
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
            })),
          )
          console.log(`  Added difficulties: ${toAdd.map((d) => d.difficulty).join(", ")}`)
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
