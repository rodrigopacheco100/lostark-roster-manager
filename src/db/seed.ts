import "dotenv/config"
import { db } from "./index"
import { raids, raidDifficulties } from "./schema"
import { eq } from "drizzle-orm"

type RaidDataItem = {

  name: string
  difficulties: {
    difficulty: string
    minIlvl: number
  }[]
}

const raidData: RaidDataItem[] = [
  {
    name: "Echidna",
    difficulties: [
      { difficulty: "Normal", minIlvl: 1620 },
      { difficulty: "Hard", minIlvl: 1630 },
    ],
  },
  {
    name: "Behemoth",
    difficulties: [{ difficulty: "Normal", minIlvl: 1640 }],
  },
  {
    name: "Aegir",
    difficulties: [
      { difficulty: "Normal", minIlvl: 1660 },
      { difficulty: "Hard", minIlvl: 1680 },
    ],
  },
  {
    name: "Brelshaza 2.0",
    difficulties: [
      { difficulty: "Normal", minIlvl: 1670 },
      { difficulty: "Hard", minIlvl: 1690 },
    ],
  },
]

async function main() {
  console.log("Seeding raids...")

  for (const raid of raidData) {
    const existing = await db.query.raids.findFirst({
      where: eq(raids.name, raid.name),
    })

    if (existing) {
      console.log(`  Skipped: ${raid.name} (already exists)`)
      continue
    }

    const [inserted] = await db
      .insert(raids)
      .values({ name: raid.name })
      .returning()

    if (inserted) {
      await db.insert(raidDifficulties).values(
        raid.difficulties.map((d) => ({
          raidId: inserted.id,
          difficulty: d.difficulty,
          minIlvl: d.minIlvl,
        })),
      )
      console.log(`  Created: ${raid.name} (${raid.difficulties.length} difficulties)`)
    }
  }

  console.log("Seed complete!")
  process.exit(0)
}

main().catch((err) => {
  console.error("Seed failed:", err)
  process.exit(1)
})
