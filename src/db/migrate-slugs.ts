import "dotenv/config"
import { eq } from "drizzle-orm"
import { db } from "./index"
import { raids } from "./schema"

function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

async function main() {
  console.log("Populating raid slugs...")

  const allRaids = await db.select().from(raids)

  for (const raid of allRaids) {
    const slug = nameToSlug(raid.name)
    await db.update(raids).set({ slug }).where(eq(raids.id, raid.id))
    console.log(`  ${raid.name} → ${slug}`)
  }

  console.log("Done!")
  process.exit(0)
}

main().catch((err) => {
  console.error("Migration failed:", err)
  process.exit(1)
})
